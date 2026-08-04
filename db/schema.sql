-- ============================================================================
--  AquaNexa (rokadoctor.in) — PostgreSQL 15+ Relational Schema
--  Dual model: Pan-India e-commerce  +  Patna-local RO service booking
--  Author: Full-Stack Architecture Blueprint
--  Convention: snake_case, UUID PKs, soft-delete via deleted_at, TIMESTAMPTZ
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";    -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";     -- fuzzy search / autosuggest
CREATE EXTENSION IF NOT EXISTS "unaccent";    -- accent-insensitive search
CREATE EXTENSION IF NOT EXISTS "citext";      -- case-insensitive email columns

-- ---------------------------------------------------------------------------
-- ENUM TYPES
-- ---------------------------------------------------------------------------
CREATE TYPE user_role          AS ENUM ('CUSTOMER','TECHNICIAN','STAFF','ADMIN','SUPER_ADMIN');
CREATE TYPE address_type       AS ENUM ('HOME','OFFICE','OTHER');
CREATE TYPE product_type       AS ENUM ('NEW_RO','SPARE_PART','COMMERCIAL_PLANT','ACCESSORY','AMC_PLAN');
CREATE TYPE product_status     AS ENUM ('DRAFT','ACTIVE','OUT_OF_STOCK','ARCHIVED');
CREATE TYPE order_status       AS ENUM ('PENDING','CONFIRMED','PACKED','SHIPPED','OUT_FOR_DELIVERY','DELIVERED','CANCELLED','RETURN_REQUESTED','RETURNED','REFUNDED');
CREATE TYPE payment_status     AS ENUM ('UNPAID','AUTHORIZED','PAID','FAILED','PARTIALLY_REFUNDED','REFUNDED');
CREATE TYPE payment_method     AS ENUM ('RAZORPAY','UPI','CARD','NETBANKING','WALLET','COD');
CREATE TYPE service_type       AS ENUM ('REPAIR','INSTALLATION','AMC_VISIT','FILTER_CHANGE','WATER_TEST','UNINSTALL_SHIFT');
CREATE TYPE service_status     AS ENUM ('NEW','CONTACTED','SCHEDULED','ASSIGNED','IN_PROGRESS','ON_HOLD_PARTS','COMPLETED','CANCELLED','NO_RESPONSE');
CREATE TYPE service_priority   AS ENUM ('LOW','NORMAL','HIGH','EMERGENCY');
CREATE TYPE cart_status        AS ENUM ('ACTIVE','CONVERTED','ABANDONED','RECOVERED','EXPIRED');
CREATE TYPE discount_type      AS ENUM ('PERCENT','FLAT','FREE_SHIPPING');
CREATE TYPE notif_channel      AS ENUM ('WHATSAPP','SMS','EMAIL','PUSH');
CREATE TYPE notif_status       AS ENUM ('QUEUED','SENT','DELIVERED','READ','FAILED');
CREATE TYPE seo_entity_type    AS ENUM ('PRODUCT','CATEGORY','STATIC_PAGE','BLOG_POST','SERVICE_AREA','BRAND');

-- ---------------------------------------------------------------------------
-- 1. IDENTITY & CRM
-- ---------------------------------------------------------------------------
CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name           VARCHAR(120)  NOT NULL,
    email               CITEXT UNIQUE,
    phone               VARCHAR(15)   UNIQUE NOT NULL,          -- E.164 minus '+', primary login in IN
    phone_verified_at   TIMESTAMPTZ,
    email_verified_at   TIMESTAMPTZ,
    password_hash       TEXT,                                    -- NULL when OTP-only account
    role                user_role     NOT NULL DEFAULT 'CUSTOMER',
    avatar_url          TEXT,
    -- CRM enrichment
    lifetime_value      NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_orders        INTEGER       NOT NULL DEFAULT 0,
    total_services      INTEGER       NOT NULL DEFAULT 0,
    customer_segment    VARCHAR(32)   DEFAULT 'NEW',             -- NEW | REPEAT | VIP | AT_RISK | CHURNED
    acquisition_source  VARCHAR(64),                             -- organic | google_ads | whatsapp | referral
    referred_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    whatsapp_opt_in     BOOLEAN       NOT NULL DEFAULT TRUE,
    marketing_opt_in    BOOLEAN       NOT NULL DEFAULT TRUE,
    last_login_at       TIMESTAMPTZ,
    notes               TEXT,                                    -- internal admin notes
    created_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),
    deleted_at          TIMESTAMPTZ
);
CREATE INDEX idx_users_phone        ON users(phone);
CREATE INDEX idx_users_role         ON users(role) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_segment      ON users(customer_segment);
CREATE INDEX idx_users_created      ON users(created_at DESC);

CREATE TABLE addresses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label           address_type NOT NULL DEFAULT 'HOME',
    contact_name    VARCHAR(120) NOT NULL,
    contact_phone   VARCHAR(15)  NOT NULL,
    line1           VARCHAR(255) NOT NULL,
    line2           VARCHAR(255),
    landmark        VARCHAR(160),
    city            VARCHAR(80)  NOT NULL,
    state           VARCHAR(80)  NOT NULL,
    pincode         VARCHAR(6)   NOT NULL,
    country         VARCHAR(2)   NOT NULL DEFAULT 'IN',
    latitude        NUMERIC(10,7),
    longitude       NUMERIC(10,7),
    is_default      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_addresses_user     ON addresses(user_id);
CREATE INDEX idx_addresses_pincode  ON addresses(pincode);
CREATE UNIQUE INDEX uq_default_addr ON addresses(user_id) WHERE is_default;

-- ---------------------------------------------------------------------------
-- 2. CATALOG
-- ---------------------------------------------------------------------------
CREATE TABLE brands (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(80) UNIQUE NOT NULL,      -- Kent, Aquaguard, Livpure, Pureit, AquaNexa
    slug        VARCHAR(96) UNIQUE NOT NULL,
    logo_url    TEXT,
    description TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE categories (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
    name          VARCHAR(120) NOT NULL,
    slug          VARCHAR(140) UNIQUE NOT NULL,
    kind          product_type NOT NULL,
    description   TEXT,
    image_url     TEXT,
    icon_key      VARCHAR(48),
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    show_in_nav   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_kind   ON categories(kind) WHERE is_active;

CREATE TABLE products (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku                 VARCHAR(64) UNIQUE NOT NULL,
    slug                VARCHAR(200) UNIQUE NOT NULL,
    name                VARCHAR(220) NOT NULL,
    short_description   VARCHAR(500),
    description         TEXT,                                  -- rich HTML from admin editor
    type                product_type NOT NULL,
    status              product_status NOT NULL DEFAULT 'DRAFT',
    brand_id            UUID REFERENCES brands(id) ON DELETE SET NULL,
    category_id         UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    -- Pricing (all INR, tax-inclusive MRP model common in IN retail)
    mrp                 NUMERIC(12,2) NOT NULL CHECK (mrp >= 0),
    selling_price       NUMERIC(12,2) NOT NULL CHECK (selling_price >= 0),
    cost_price          NUMERIC(12,2),                          -- admin-only margin calc
    tax_rate            NUMERIC(5,2)  NOT NULL DEFAULT 18.00,   -- GST %
    hsn_code            VARCHAR(12),
    -- Inventory
    stock_quantity      INTEGER NOT NULL DEFAULT 0,
    low_stock_threshold INTEGER NOT NULL DEFAULT 5,
    allow_backorder     BOOLEAN NOT NULL DEFAULT FALSE,
    -- Logistics
    weight_grams        INTEGER,
    length_cm           NUMERIC(6,2),
    width_cm            NUMERIC(6,2),
    height_cm           NUMERIC(6,2),
    is_pan_india        BOOLEAN NOT NULL DEFAULT TRUE,          -- FALSE => Patna-only (e.g. commercial plant w/ install)
    requires_installation BOOLEAN NOT NULL DEFAULT FALSE,
    free_shipping       BOOLEAN NOT NULL DEFAULT FALSE,
    -- Faceted filter columns (denormalised for fast filtering)
    purification_tech   TEXT[],                                 -- {RO,UV,UF,TDS_CONTROLLER,ALKALINE,COPPER,MINERAL}
    storage_litres      NUMERIC(6,2),
    capacity_lph        INTEGER,                                -- commercial plants: litres/hour
    warranty_months     INTEGER,
    -- Merchandising
    is_featured         BOOLEAN NOT NULL DEFAULT FALSE,
    is_bestseller       BOOLEAN NOT NULL DEFAULT FALSE,
    rating_avg          NUMERIC(3,2) NOT NULL DEFAULT 0,
    rating_count        INTEGER NOT NULL DEFAULT 0,
    view_count          INTEGER NOT NULL DEFAULT 0,
    sold_count          INTEGER NOT NULL DEFAULT 0,
    search_vector       TSVECTOR,
    created_by          UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at          TIMESTAMPTZ,
    CONSTRAINT chk_price_lte_mrp CHECK (selling_price <= mrp)
);
CREATE INDEX idx_products_category   ON products(category_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_brand      ON products(brand_id);
CREATE INDEX idx_products_status     ON products(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_price      ON products(selling_price);
CREATE INDEX idx_products_tech       ON products USING GIN (purification_tech);
CREATE INDEX idx_products_search     ON products USING GIN (search_vector);
CREATE INDEX idx_products_name_trgm  ON products USING GIN (name gin_trgm_ops);
CREATE INDEX idx_products_featured   ON products(is_featured) WHERE status = 'ACTIVE';

-- Auto-maintain full-text search vector (name^A, brand/short^B, description^C)
CREATE OR REPLACE FUNCTION products_search_vector_trigger() RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', unaccent(coalesce(NEW.name,''))), 'A') ||
        setweight(to_tsvector('english', unaccent(coalesce(NEW.short_description,''))), 'B') ||
        setweight(to_tsvector('english', unaccent(coalesce(NEW.sku,''))), 'B') ||
        setweight(to_tsvector('english', unaccent(coalesce(NEW.description,''))), 'C');
    RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_search
    BEFORE INSERT OR UPDATE OF name, short_description, description, sku
    ON products FOR EACH ROW EXECUTE FUNCTION products_search_vector_trigger();

-- 2..5 zoomable images per product (enforced in app layer + check below)
CREATE TABLE product_images (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url           TEXT NOT NULL,             -- CDN original (>=1600px for zoom)
    thumb_url     TEXT,                      -- 300px grid thumb
    zoom_url      TEXT,                      -- 2000px zoom layer
    alt_text      VARCHAR(200) NOT NULL,     -- SEO: "Kent Grand Plus 8L RO Purifier front view"
    display_order INTEGER NOT NULL DEFAULT 0,
    is_primary    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_prod_images ON product_images(product_id, display_order);
CREATE UNIQUE INDEX uq_primary_image ON product_images(product_id) WHERE is_primary;

-- Flexible key/value technical specs rendered as PDP spec table
CREATE TABLE product_specifications (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    spec_group    VARCHAR(80) NOT NULL DEFAULT 'General',   -- General | Purification | Electrical | Dimensions
    spec_key      VARCHAR(120) NOT NULL,                    -- "Storage Capacity"
    spec_value    VARCHAR(300) NOT NULL,                    -- "8 Litres"
    display_order INTEGER NOT NULL DEFAULT 0,
    UNIQUE (product_id, spec_group, spec_key)
);
CREATE INDEX idx_prod_specs ON product_specifications(product_id);

CREATE TABLE product_variants (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id     UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku            VARCHAR(64) UNIQUE NOT NULL,
    variant_name   VARCHAR(120) NOT NULL,      -- "75 GPD" / "White" / "10 inch"
    attributes     JSONB NOT NULL DEFAULT '{}',
    selling_price  NUMERIC(12,2) NOT NULL,
    mrp            NUMERIC(12,2) NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    image_url      TEXT,
    is_active      BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE INDEX idx_variants_product ON product_variants(product_id);

-- Which spare part fits which machine (cross-sell + "compatible models" on PDP)
CREATE TABLE product_compatibility (
    part_product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    machine_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    PRIMARY KEY (part_product_id, machine_product_id)
);

CREATE TABLE product_reviews (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id     UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id        UUID REFERENCES users(id) ON DELETE SET NULL,
    order_id       UUID,                                    -- verified-purchase link
    rating         SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title          VARCHAR(160),
    body           TEXT,
    image_urls     TEXT[],
    is_verified    BOOLEAN NOT NULL DEFAULT FALSE,
    is_approved    BOOLEAN NOT NULL DEFAULT FALSE,
    helpful_count  INTEGER NOT NULL DEFAULT 0,
    admin_reply    TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_reviews_product ON product_reviews(product_id) WHERE is_approved;

-- ---------------------------------------------------------------------------
-- 3. SERVICEABILITY & LOGISTICS
-- ---------------------------------------------------------------------------
CREATE TABLE pincodes (
    pincode              VARCHAR(6) PRIMARY KEY,
    city                 VARCHAR(80)  NOT NULL,
    district             VARCHAR(80),
    state                VARCHAR(80)  NOT NULL,
    zone                 VARCHAR(16),                        -- NORTH | EAST | ...
    is_cod_available     BOOLEAN NOT NULL DEFAULT TRUE,
    is_delivery_available BOOLEAN NOT NULL DEFAULT TRUE,
    -- Local Patna service network flag  → drives "Book Service" eligibility
    is_service_available BOOLEAN NOT NULL DEFAULT FALSE,
    visit_charge         NUMERIC(8,2) NOT NULL DEFAULT 200.00,
    standard_eta_days    SMALLINT NOT NULL DEFAULT 5,
    express_eta_days     SMALLINT,
    shipping_zone_rate   NUMERIC(8,2) NOT NULL DEFAULT 0,
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_pincode_service ON pincodes(is_service_available) WHERE is_service_available;
CREATE INDEX idx_pincode_city    ON pincodes(city);

-- ---------------------------------------------------------------------------
-- 4. CART & ABANDONED-CART RECOVERY
-- ---------------------------------------------------------------------------
CREATE TABLE carts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token       VARCHAR(64) UNIQUE,                  -- guest carts
    status              cart_status NOT NULL DEFAULT 'ACTIVE',
    subtotal            NUMERIC(12,2) NOT NULL DEFAULT 0,
    coupon_id           UUID,
    discount_amount     NUMERIC(12,2) NOT NULL DEFAULT 0,
    -- Recovery engine
    last_activity_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    abandoned_at        TIMESTAMPTZ,
    recovery_stage      SMALLINT NOT NULL DEFAULT 0,         -- 0=none 1=1hr 2=24hr 3=72hr(+coupon)
    recovery_sent_at    TIMESTAMPTZ,
    recovery_token      VARCHAR(64) UNIQUE,                  -- one-click restore link
    recovered_at        TIMESTAMPTZ,
    converted_order_id  UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_carts_user      ON carts(user_id);
CREATE INDEX idx_carts_abandoned ON carts(status, last_activity_at) WHERE status IN ('ACTIVE','ABANDONED');

CREATE TABLE cart_items (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id      UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id   UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id   UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    quantity     INTEGER NOT NULL CHECK (quantity > 0),
    unit_price   NUMERIC(12,2) NOT NULL,                     -- price snapshot at add-time
    added_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (cart_id, product_id, variant_id)
);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);

CREATE TABLE wishlists (
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    added_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, product_id)
);

-- ---------------------------------------------------------------------------
-- 5. COUPONS & PROMOTIONS
-- ---------------------------------------------------------------------------
CREATE TABLE coupons (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code               VARCHAR(40) UNIQUE NOT NULL,
    description        VARCHAR(240),
    discount_type      discount_type NOT NULL,
    discount_value     NUMERIC(10,2) NOT NULL,
    max_discount       NUMERIC(10,2),
    min_order_value    NUMERIC(10,2) NOT NULL DEFAULT 0,
    usage_limit_total  INTEGER,
    usage_limit_user   INTEGER NOT NULL DEFAULT 1,
    used_count         INTEGER NOT NULL DEFAULT 0,
    applies_to_type    product_type,                       -- NULL = all
    is_recovery_only   BOOLEAN NOT NULL DEFAULT FALSE,     -- issued by abandoned-cart engine
    starts_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    ends_at            TIMESTAMPTZ,
    is_active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE coupon_redemptions (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id  UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
    order_id   UUID,
    amount     NUMERIC(10,2) NOT NULL,
    used_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 6. ORDERS (Pan-India e-commerce)
-- ---------------------------------------------------------------------------
CREATE TABLE orders (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number          VARCHAR(24) UNIQUE NOT NULL,        -- AQN-2026-000148
    user_id               UUID REFERENCES users(id) ON DELETE SET NULL,
    guest_email           CITEXT,
    guest_phone           VARCHAR(15),
    status                order_status   NOT NULL DEFAULT 'PENDING',
    payment_status        payment_status NOT NULL DEFAULT 'UNPAID',
    payment_method        payment_method,
    -- Money
    subtotal              NUMERIC(12,2) NOT NULL,
    discount_amount       NUMERIC(12,2) NOT NULL DEFAULT 0,
    shipping_amount       NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_amount            NUMERIC(12,2) NOT NULL DEFAULT 0,
    cod_charge            NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_amount          NUMERIC(12,2) NOT NULL,
    currency              VARCHAR(3) NOT NULL DEFAULT 'INR',
    coupon_id             UUID REFERENCES coupons(id) ON DELETE SET NULL,
    -- Address snapshots (immutable copies — never join to addresses for history)
    shipping_address      JSONB NOT NULL,
    billing_address       JSONB,
    shipping_pincode      VARCHAR(6) NOT NULL,
    -- Fulfilment
    courier_partner       VARCHAR(60),                        -- Delhivery | BlueDart | XpressBees
    tracking_number       VARCHAR(80),
    tracking_url          TEXT,
    shipped_at            TIMESTAMPTZ,
    delivered_at          TIMESTAMPTZ,
    estimated_delivery    DATE,
    -- Meta
    customer_note         TEXT,
    admin_note            TEXT,
    cancel_reason         TEXT,
    source_cart_id        UUID REFERENCES carts(id) ON DELETE SET NULL,
    utm_source            VARCHAR(64),
    placed_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_orders_user     ON orders(user_id);
CREATE INDEX idx_orders_status   ON orders(status);
CREATE INDEX idx_orders_placed   ON orders(placed_at DESC);
CREATE INDEX idx_orders_number   ON orders(order_number);
CREATE INDEX idx_orders_payment  ON orders(payment_status);

CREATE TABLE order_items (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id          UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id        UUID REFERENCES products(id) ON DELETE SET NULL,
    variant_id        UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    -- Snapshots so historical invoices never mutate
    product_name      VARCHAR(220) NOT NULL,
    product_sku       VARCHAR(64)  NOT NULL,
    product_image_url TEXT,
    quantity          INTEGER NOT NULL CHECK (quantity > 0),
    unit_price        NUMERIC(12,2) NOT NULL,
    tax_rate          NUMERIC(5,2)  NOT NULL DEFAULT 18.00,
    line_total        NUMERIC(12,2) NOT NULL
);
CREATE INDEX idx_order_items_order ON order_items(order_id);

CREATE TABLE order_status_history (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id     UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    from_status  order_status,
    to_status    order_status NOT NULL,
    note         TEXT,
    changed_by   UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_osh_order ON order_status_history(order_id, created_at);

CREATE TABLE payments (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id              UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    gateway               VARCHAR(24) NOT NULL DEFAULT 'RAZORPAY',
    gateway_order_id      VARCHAR(80),
    gateway_payment_id    VARCHAR(80) UNIQUE,
    gateway_signature     TEXT,
    method                payment_method,
    amount                NUMERIC(12,2) NOT NULL,
    status                payment_status NOT NULL DEFAULT 'UNPAID',
    failure_reason        TEXT,
    raw_payload           JSONB,
    refund_amount         NUMERIC(12,2) NOT NULL DEFAULT 0,
    refunded_at           TIMESTAMPTZ,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_payments_order ON payments(order_id);

-- ---------------------------------------------------------------------------
-- 7. LOCAL SERVICE BOOKING (Patna operations)
-- ---------------------------------------------------------------------------
CREATE TABLE technicians (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    employee_code       VARCHAR(24) UNIQUE NOT NULL,
    full_name           VARCHAR(120) NOT NULL,
    phone               VARCHAR(15) NOT NULL,
    skills              TEXT[],                       -- {RO_REPAIR,UV,COMMERCIAL_PLANT,PLUMBING}
    service_pincodes    TEXT[],                       -- coverage within Patna
    is_available        BOOLEAN NOT NULL DEFAULT TRUE,
    active_jobs         INTEGER NOT NULL DEFAULT 0,
    max_daily_jobs      INTEGER NOT NULL DEFAULT 8,
    rating_avg          NUMERIC(3,2) NOT NULL DEFAULT 0,
    jobs_completed      INTEGER NOT NULL DEFAULT 0,
    joined_at           DATE,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_tech_pincodes ON technicians USING GIN (service_pincodes);

CREATE TABLE service_requests (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number       VARCHAR(24) UNIQUE NOT NULL,       -- SRV-2026-00421
    user_id             UUID REFERENCES users(id) ON DELETE SET NULL,
    -- Lead capture (form works without login — critical for conversion)
    customer_name       VARCHAR(120) NOT NULL,
    customer_phone      VARCHAR(15)  NOT NULL,
    alt_phone           VARCHAR(15),
    customer_email      CITEXT,
    -- Location
    address_line        VARCHAR(320) NOT NULL,
    landmark            VARCHAR(160),
    area                VARCHAR(120),                      -- Kankarbagh, Boring Road, Patliputra...
    city                VARCHAR(80) NOT NULL DEFAULT 'Patna',
    state               VARCHAR(80) NOT NULL DEFAULT 'Bihar',
    pincode             VARCHAR(6) NOT NULL,
    latitude            NUMERIC(10,7),
    longitude           NUMERIC(10,7),
    -- Job details
    service_type        service_type NOT NULL DEFAULT 'REPAIR',
    machine_brand       VARCHAR(80),
    machine_model       VARCHAR(120),
    purchase_year       SMALLINT,
    issue_category      VARCHAR(80),                       -- NO_WATER | LEAKAGE | BAD_TASTE | NOISE | TDS_HIGH
    issue_description   TEXT NOT NULL,
    issue_image_urls    TEXT[],
    -- Scheduling
    preferred_date      DATE,
    preferred_slot      VARCHAR(24),                       -- 09-12 | 12-15 | 15-18 | 18-21
    scheduled_at        TIMESTAMPTZ,
    -- Workflow
    status              service_status   NOT NULL DEFAULT 'NEW',
    priority            service_priority NOT NULL DEFAULT 'NORMAL',
    assigned_technician_id UUID REFERENCES technicians(id) ON DELETE SET NULL,
    assigned_at         TIMESTAMPTZ,
    started_at          TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    -- Money
    visit_charge        NUMERIC(8,2)  NOT NULL DEFAULT 200.00,
    parts_charge        NUMERIC(10,2) NOT NULL DEFAULT 0,
    labour_charge       NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_charge        NUMERIC(10,2) NOT NULL DEFAULT 0,
    payment_status      payment_status NOT NULL DEFAULT 'UNPAID',
    -- Resolution
    resolution_note     TEXT,
    parts_replaced      JSONB,                             -- [{product_id, name, qty, price}]
    warranty_days       INTEGER NOT NULL DEFAULT 30,
    customer_rating     SMALLINT CHECK (customer_rating BETWEEN 1 AND 5),
    customer_feedback   TEXT,
    -- Attribution
    source              VARCHAR(32) NOT NULL DEFAULT 'WEBSITE_FORM', -- WEBSITE_FORM | CALL | WHATSAPP | GMB
    internal_note       TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sr_status      ON service_requests(status);
CREATE INDEX idx_sr_tech        ON service_requests(assigned_technician_id);
CREATE INDEX idx_sr_created     ON service_requests(created_at DESC);
CREATE INDEX idx_sr_phone       ON service_requests(customer_phone);
CREATE INDEX idx_sr_pincode     ON service_requests(pincode);
CREATE INDEX idx_sr_open        ON service_requests(status, priority) WHERE status NOT IN ('COMPLETED','CANCELLED');

CREATE TABLE service_status_history (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id   UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
    from_status  service_status,
    to_status    service_status NOT NULL,
    note         TEXT,
    changed_by   UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE amc_subscriptions (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_name         VARCHAR(80) NOT NULL,          -- Basic / Gold / Platinum AMC
    machine_brand     VARCHAR(80),
    machine_model     VARCHAR(120),
    address_id        UUID REFERENCES addresses(id) ON DELETE SET NULL,
    price             NUMERIC(10,2) NOT NULL,
    visits_included   SMALLINT NOT NULL DEFAULT 4,
    visits_used       SMALLINT NOT NULL DEFAULT 0,
    starts_on         DATE NOT NULL,
    ends_on           DATE NOT NULL,
    next_service_due  DATE,
    is_active         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_amc_due ON amc_subscriptions(next_service_due) WHERE is_active;

-- ---------------------------------------------------------------------------
-- 8. DYNAMIC SEO CONTROL (admin-editable per entity)
-- ---------------------------------------------------------------------------
CREATE TABLE seo_metadata (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type       seo_entity_type NOT NULL,
    entity_id         UUID,                         -- NULL for STATIC_PAGE (use path)
    path              VARCHAR(300),                 -- '/', '/ro-service-patna'
    meta_title        VARCHAR(200),
    meta_description  VARCHAR(500),
    meta_keywords     TEXT,
    canonical_url     TEXT,
    og_title          VARCHAR(200),
    og_description    VARCHAR(500),
    og_image_url      TEXT,
    twitter_card      VARCHAR(32) DEFAULT 'summary_large_image',
    robots_index      BOOLEAN NOT NULL DEFAULT TRUE,
    robots_follow     BOOLEAN NOT NULL DEFAULT TRUE,
    schema_json       JSONB,                        -- custom JSON-LD override
    priority          NUMERIC(2,1) DEFAULT 0.7,     -- sitemap.xml
    change_frequency  VARCHAR(16) DEFAULT 'weekly',
    updated_by        UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (entity_type, entity_id),
    UNIQUE (path)
);
CREATE INDEX idx_seo_entity ON seo_metadata(entity_type, entity_id);

-- Local-SEO landing pages: /ro-service-in-kankarbagh, /ro-repair-boring-road ...
CREATE TABLE service_areas (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    area_name        VARCHAR(120) NOT NULL,        -- Kankarbagh
    slug             VARCHAR(140) UNIQUE NOT NULL, -- ro-service-in-kankarbagh-patna
    city             VARCHAR(80) NOT NULL DEFAULT 'Patna',
    state            VARCHAR(80) NOT NULL DEFAULT 'Bihar',
    pincodes         TEXT[] NOT NULL,
    latitude         NUMERIC(10,7),
    longitude        NUMERIC(10,7),
    hero_heading     VARCHAR(220),
    content_html     TEXT,
    landmarks        TEXT[],
    avg_response_min INTEGER DEFAULT 120,
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,
    display_order    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE redirects (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_path   VARCHAR(300) UNIQUE NOT NULL,
    to_path     VARCHAR(300) NOT NULL,
    status_code SMALLINT NOT NULL DEFAULT 301,
    hit_count   INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 9. NOTIFICATIONS (WhatsApp / SMS / Email outbox)
-- ---------------------------------------------------------------------------
CREATE TABLE notification_templates (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key            VARCHAR(80) UNIQUE NOT NULL,   -- order_confirmed | service_assigned | cart_recovery_1
    channel        notif_channel NOT NULL,
    wa_template_id VARCHAR(120),                  -- Meta-approved template name
    language       VARCHAR(8) NOT NULL DEFAULT 'en',
    subject        VARCHAR(200),
    body           TEXT NOT NULL,                 -- {{1}} placeholders
    variables      TEXT[],
    is_active      BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE notifications (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID REFERENCES users(id) ON DELETE SET NULL,
    channel        notif_channel NOT NULL,
    template_key   VARCHAR(80),
    recipient      VARCHAR(160) NOT NULL,         -- phone or email
    payload        JSONB,
    status         notif_status NOT NULL DEFAULT 'QUEUED',
    provider_msg_id VARCHAR(160),
    error_message  TEXT,
    related_type   VARCHAR(40),                   -- ORDER | SERVICE_REQUEST | CART
    related_id     UUID,
    attempts       SMALLINT NOT NULL DEFAULT 0,
    scheduled_for  TIMESTAMPTZ NOT NULL DEFAULT now(),
    sent_at        TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notif_queue ON notifications(status, scheduled_for) WHERE status = 'QUEUED';
CREATE INDEX idx_notif_rel   ON notifications(related_type, related_id);

-- ---------------------------------------------------------------------------
-- 10. ANALYTICS & AUDIT
-- ---------------------------------------------------------------------------
CREATE TABLE daily_metrics (
    metric_date            DATE PRIMARY KEY,
    revenue_ecommerce      NUMERIC(14,2) NOT NULL DEFAULT 0,
    revenue_service        NUMERIC(14,2) NOT NULL DEFAULT 0,
    orders_count           INTEGER NOT NULL DEFAULT 0,
    orders_delivered       INTEGER NOT NULL DEFAULT 0,
    orders_cancelled       INTEGER NOT NULL DEFAULT 0,
    avg_order_value        NUMERIC(12,2) NOT NULL DEFAULT 0,
    service_requests_new   INTEGER NOT NULL DEFAULT 0,
    service_requests_done  INTEGER NOT NULL DEFAULT 0,
    new_customers          INTEGER NOT NULL DEFAULT 0,
    sessions               INTEGER NOT NULL DEFAULT 0,
    carts_created          INTEGER NOT NULL DEFAULT 0,
    carts_abandoned        INTEGER NOT NULL DEFAULT 0,
    carts_recovered        INTEGER NOT NULL DEFAULT 0,
    recovered_revenue      NUMERIC(14,2) NOT NULL DEFAULT 0,
    computed_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE search_queries (
    id           BIGSERIAL PRIMARY KEY,
    query        VARCHAR(200) NOT NULL,
    user_id      UUID REFERENCES users(id) ON DELETE SET NULL,
    result_count INTEGER NOT NULL DEFAULT 0,
    clicked_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sq_query ON search_queries(query);

CREATE TABLE audit_logs (
    id          BIGSERIAL PRIMARY KEY,
    actor_id    UUID REFERENCES users(id) ON DELETE SET NULL,
    action      VARCHAR(80) NOT NULL,             -- product.update | order.status_change
    entity_type VARCHAR(60) NOT NULL,
    entity_id   UUID,
    before_data JSONB,
    after_data  JSONB,
    ip_address  INET,
    user_agent  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id, created_at DESC);

CREATE TABLE site_settings (
    key         VARCHAR(80) PRIMARY KEY,
    value       JSONB NOT NULL,
    description TEXT,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admin-uploaded images. Vercel's filesystem is read-only at runtime, so
-- uploads cannot be written into public/. Bytes live here (served by
-- /api/media/[id]) unless BLOB_READ_WRITE_TOKEN is set, in which case the
-- file goes to Vercel Blob and only external_url is populated.
CREATE TABLE media_assets (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename     VARCHAR(255) NOT NULL,
    mime_type    VARCHAR(64)  NOT NULL,
    bytes        INTEGER      NOT NULL,
    width        INTEGER,
    height       INTEGER,
    data         BYTEA,
    thumb_data   BYTEA,
    external_url TEXT,
    alt_text     VARCHAR(200),
    folder       VARCHAR(40)  NOT NULL DEFAULT 'products',
    checksum     VARCHAR(64)  NOT NULL UNIQUE,
    uploaded_by  UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT chk_media_has_payload CHECK (data IS NOT NULL OR external_url IS NOT NULL)
);
CREATE INDEX idx_media_folder ON media_assets(folder, created_at DESC);

-- Deferred FKs that reference later-created tables
ALTER TABLE carts               ADD CONSTRAINT fk_cart_coupon  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL;
ALTER TABLE carts               ADD CONSTRAINT fk_cart_order   FOREIGN KEY (converted_order_id) REFERENCES orders(id) ON DELETE SET NULL;
ALTER TABLE coupon_redemptions  ADD CONSTRAINT fk_cr_order     FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;
ALTER TABLE product_reviews     ADD CONSTRAINT fk_review_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- 11. TRIGGERS: updated_at auto-touch
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$ LANGUAGE plpgsql;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['users','addresses','categories','products','carts','orders','service_requests','pincodes']
  LOOP
    EXECUTE format('CREATE TRIGGER trg_touch_%1$s BEFORE UPDATE ON %1$s
                    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();', t);
  END LOOP;
END $$;

-- Keep products.rating_avg in sync with approved reviews
CREATE OR REPLACE FUNCTION recalc_product_rating() RETURNS trigger AS $$
BEGIN
  UPDATE products p SET
    rating_avg   = COALESCE((SELECT ROUND(AVG(rating)::numeric,2) FROM product_reviews r WHERE r.product_id = p.id AND r.is_approved),0),
    rating_count = (SELECT COUNT(*) FROM product_reviews r WHERE r.product_id = p.id AND r.is_approved)
  WHERE p.id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN NULL;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_recalc_rating AFTER INSERT OR UPDATE OR DELETE ON product_reviews
  FOR EACH ROW EXECUTE FUNCTION recalc_product_rating();

-- ---------------------------------------------------------------------------
-- 12. REPORTING VIEWS (power the Admin dashboard charts)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_daily_revenue AS
SELECT d::date AS day,
       COALESCE(SUM(o.total_amount) FILTER (WHERE o.payment_status = 'PAID'), 0) AS ecommerce_revenue,
       COUNT(o.id)                                                               AS orders,
       COALESCE(AVG(o.total_amount) FILTER (WHERE o.payment_status = 'PAID'), 0) AS aov
FROM generate_series(now() - interval '89 days', now(), interval '1 day') d
LEFT JOIN orders o ON o.placed_at::date = d::date AND o.status <> 'CANCELLED'
GROUP BY 1 ORDER BY 1;

CREATE OR REPLACE VIEW v_service_pipeline AS
SELECT status, priority, COUNT(*) AS total,
       COUNT(*) FILTER (WHERE created_at > now() - interval '24 hours') AS last_24h,
       ROUND(AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/3600)::numeric, 1) AS avg_hours_to_close
FROM service_requests GROUP BY 1,2;

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

-- ---------------------------------------------------------------------------
-- 13. SEED — Patna serviceable pincodes + core settings
-- ---------------------------------------------------------------------------
INSERT INTO pincodes (pincode, city, district, state, zone, is_service_available, visit_charge, standard_eta_days) VALUES
  ('800001','Patna','Patna','Bihar','EAST',TRUE,200.00,2),
  ('800002','Patna','Patna','Bihar','EAST',TRUE,200.00,2),
  ('800003','Patna','Patna','Bihar','EAST',TRUE,200.00,2),
  ('800004','Patna','Patna','Bihar','EAST',TRUE,200.00,2),
  ('800005','Patna','Patna','Bihar','EAST',TRUE,200.00,2),
  ('800006','Patna','Patna','Bihar','EAST',TRUE,200.00,2),
  ('800007','Patna','Patna','Bihar','EAST',TRUE,200.00,2),
  ('800008','Patna','Patna','Bihar','EAST',TRUE,200.00,2),
  ('800013','Patna','Patna','Bihar','EAST',TRUE,200.00,2),
  ('800014','Patna','Patna','Bihar','EAST',TRUE,200.00,2),
  ('800020','Patna','Patna','Bihar','EAST',TRUE,200.00,2),
  ('800023','Patna','Patna','Bihar','EAST',TRUE,200.00,2),
  ('800024','Patna','Patna','Bihar','EAST',TRUE,200.00,2),
  ('800025','Patna','Patna','Bihar','EAST',TRUE,200.00,2),
  ('800026','Patna','Patna','Bihar','EAST',TRUE,200.00,2),
  ('801503','Patna','Patna','Bihar','EAST',TRUE,250.00,3),
  ('110001','New Delhi','New Delhi','Delhi','NORTH',FALSE,0,4),
  ('400001','Mumbai','Mumbai','Maharashtra','WEST',FALSE,0,5),
  ('560001','Bengaluru','Bengaluru','Karnataka','SOUTH',FALSE,0,5),
  ('700001','Kolkata','Kolkata','West Bengal','EAST',FALSE,0,4)
ON CONFLICT (pincode) DO NOTHING;

INSERT INTO site_settings (key, value, description) VALUES
  ('contact', '{"primary_phone":"8969821440","secondary_phone":"9661288308","whatsapp":"918969821440","email":"support@rokadoctor.in"}', 'Public contact channels'),
  ('service', '{"visit_charge":200,"city":"Patna","state":"Bihar","hours":"08:00-21:00","same_day_cutoff":"17:00"}', 'Local service config'),
  ('shipping', '{"free_above":1999,"flat_rate":99,"cod_charge":49,"cod_max":15000}', 'Pan-India shipping rules'),
  ('abandoned_cart', '{"stage1_minutes":60,"stage2_hours":24,"stage3_hours":72,"stage3_coupon":"COMEBACK10"}', 'Recovery cadence')
ON CONFLICT (key) DO NOTHING;

INSERT INTO service_areas (area_name, slug, pincodes, hero_heading, display_order) VALUES
  ('Kankarbagh','ro-service-in-kankarbagh-patna','{800020,800026}','RO Service in Kankarbagh, Patna — ₹200 Visit Charge',1),
  ('Boring Road','ro-service-in-boring-road-patna','{800001,800013}','RO Repair in Boring Road, Patna — Same-Day Visit',2),
  ('Patliputra Colony','ro-service-in-patliputra-patna','{800013}','RO Service in Patliputra Colony, Patna',3),
  ('Rajendra Nagar','ro-service-in-rajendra-nagar-patna','{800016}','RO Repair in Rajendra Nagar, Patna',4),
  ('Danapur','ro-service-in-danapur-patna','{801503}','RO Service in Danapur, Patna',5)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
