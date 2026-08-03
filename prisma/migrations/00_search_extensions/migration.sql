-- ============================================================================
--  SEARCH LAYER — features Prisma's schema language cannot express.
--
--  WHY THIS FILE EXISTS:
--  `prisma db push` / `prisma migrate` will NOT create tsvector columns,
--  GIN indexes, or PostgreSQL extensions. Without this migration the
--  autosuggest endpoint silently returns zero results — the query fails and
--  the catch block swallows it.
--
--  RUN THIS AFTER EVERY `prisma db push` ON A FRESH DATABASE:
--     npm run db:search
--
--  Safe to re-run (all statements are idempotent).
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- ── Full-text search vector ────────────────────────────────────────────────
ALTER TABLE products ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION products_search_vector_trigger() RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', unaccent(coalesce(NEW.name,''))), 'A') ||
        setweight(to_tsvector('english', unaccent(coalesce(NEW.short_description,''))), 'B') ||
        setweight(to_tsvector('english', unaccent(coalesce(NEW.sku,''))), 'B') ||
        setweight(to_tsvector('english', unaccent(coalesce(NEW.description,''))), 'C');
    RETURN NEW;
END $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_search ON products;
CREATE TRIGGER trg_products_search
    BEFORE INSERT OR UPDATE OF name, short_description, description, sku
    ON products FOR EACH ROW EXECUTE FUNCTION products_search_vector_trigger();

-- Backfill any rows inserted before the trigger existed
UPDATE products SET name = name WHERE search_vector IS NULL;

-- ── Indexes powering search + fuzzy matching ───────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_search    ON products USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_tech      ON products USING GIN (purification_tech);
CREATE INDEX IF NOT EXISTS idx_tech_pincodes      ON technicians USING GIN (service_pincodes);

-- ── Business rules Prisma cannot express ───────────────────────────────────
ALTER TABLE products DROP CONSTRAINT IF EXISTS chk_price_lte_mrp;
ALTER TABLE products ADD  CONSTRAINT chk_price_lte_mrp CHECK (selling_price <= mrp);

-- Exactly one primary image per product
DROP INDEX IF EXISTS uq_primary_image;
CREATE UNIQUE INDEX uq_primary_image ON product_images(product_id) WHERE is_primary;

-- One default address per user
DROP INDEX IF EXISTS uq_default_addr;
CREATE UNIQUE INDEX uq_default_addr ON addresses(user_id) WHERE is_default;

-- ── Rating auto-recalculation (approved reviews only) ──────────────────────
CREATE OR REPLACE FUNCTION recalc_product_rating() RETURNS trigger AS $$
BEGIN
  UPDATE products p SET
    rating_avg   = COALESCE((SELECT ROUND(AVG(rating)::numeric,2) FROM product_reviews r
                             WHERE r.product_id = p.id AND r.is_approved), 0),
    rating_count = (SELECT COUNT(*) FROM product_reviews r
                    WHERE r.product_id = p.id AND r.is_approved)
  WHERE p.id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN NULL;
END $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_recalc_rating ON product_reviews;
CREATE TRIGGER trg_recalc_rating AFTER INSERT OR UPDATE OR DELETE ON product_reviews
  FOR EACH ROW EXECUTE FUNCTION recalc_product_rating();

-- ── Reporting views used by the admin dashboard ────────────────────────────
CREATE OR REPLACE VIEW v_low_stock AS
SELECT p.id, p.sku, p.name, p.stock_quantity, p.low_stock_threshold, c.name AS category
FROM products p JOIN categories c ON c.id = p.category_id
WHERE p.deleted_at IS NULL AND p.status = 'ACTIVE'
  AND p.stock_quantity <= p.low_stock_threshold
ORDER BY p.stock_quantity ASC;

CREATE OR REPLACE VIEW v_abandoned_carts AS
SELECT c.id, c.user_id, u.full_name, u.phone, c.subtotal, c.recovery_stage,
       c.last_activity_at, COUNT(ci.id) AS item_count
FROM carts c
LEFT JOIN users u ON u.id = c.user_id
LEFT JOIN cart_items ci ON ci.cart_id = c.id
WHERE c.status IN ('ACTIVE','ABANDONED')
  AND c.last_activity_at < now() - interval '1 hour'
  AND c.subtotal > 0
GROUP BY c.id, u.full_name, u.phone
ORDER BY c.subtotal DESC;
