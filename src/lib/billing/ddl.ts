/**
 * BILLING TABLES KA DDL — code me embed kyun hai?
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Vercel pe deploy ke waqt sirf `prisma generate && next build` chalta hai —
 * koi migration nahi. Matlab nayi tables apne aap nahi banti. Teen raaste the:
 *
 *   1. build script me `prisma migrate deploy` jodna
 *      → poora deploy fail kar sakta hai agar DB ek second ko busy ho.
 *        Live site down. Reject.
 *   2. `prisma db push` production pe
 *      → yeh schema ko FORCE match karta hai; agar kabhi schema.prisma
 *        purana hua to data drop kar sakta hai. Reject.
 *   3. Admin panel me ek button jo sirf CREATE TABLE IF NOT EXISTS chalaye
 *      → kuch drop nahi hota, dobara dabao to kuch nahi bigadta,
 *        aur owner ko dikhta hai ki kya hua. ✅ Yahi liya gaya.
 *
 * File se padhne ke bajaye string me isliye hai kyunki Next.js serverless
 * bundle me `prisma/` folder nahi jaata — runtime pe fs.readFile fail hota.
 *
 * Yahi SQL `prisma/migrations/01_billing/migration.sql` me bhi hai, agar
 * owner Neon ke SQL Editor me khud paste karna chahe.
 *
 * ⚠️ Is file me kabhi DROP / ALTER COLUMN / DELETE mat likhna.
 */

export const BILLING_DDL = `-- ═══════════════════════════════════════════════════════════════════════
-- AQUA PERL — BILLING / GRAHAK RECORD / AMC  (10 Oct 2026)
--
-- Yeh script SIRF nayi tables banata hai. Ek bhi purani table ko
-- chhuta nahi, ek bhi column drop nahi karta, koi data delete nahi karta.
-- Dobara chalane se kuch nahi bigdega (IF NOT EXISTS / duplicate ignore).
--
-- CHALANE KE 2 TARIKE:
--   1. Admin panel → Bill / Invoice → "Database taiyaar karo" button  (aasan)
--   2. Neon dashboard → SQL Editor → yeh poori file paste → Run      (manual)
-- ═══════════════════════════════════════════════════════════════════════

DO $$ BEGIN
CREATE TYPE "BillType" AS ENUM ('SALE', 'SERVICE', 'AMC', 'INSTALLATION', 'OTHER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
CREATE TYPE "BillStatus" AS ENUM ('DRAFT', 'UNPAID', 'PARTIAL', 'PAID', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
CREATE TYPE "UnitStatus" AS ENUM ('ACTIVE', 'REPLACED', 'REMOVED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
CREATE TYPE "AmcRecordStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "billing_clients" (
    "id" UUID NOT NULL,
    "phone" VARCHAR(15) NOT NULL,
    "full_name" VARCHAR(120) NOT NULL,
    "alt_phone" VARCHAR(15),
    "email" VARCHAR(160),
    "address_line" VARCHAR(400),
    "landmark" VARCHAR(160),
    "area" VARCHAR(120),
    "city" VARCHAR(80) NOT NULL DEFAULT 'Patna',
    "state" VARCHAR(80) NOT NULL DEFAULT 'Bihar',
    "pincode" VARCHAR(6),
    "gstin" VARCHAR(15),
    "total_billed" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_paid" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "bill_count" INTEGER NOT NULL DEFAULT 0,
    "last_bill_at" TIMESTAMPTZ,
    "source" VARCHAR(32) NOT NULL DEFAULT 'ADMIN',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "billing_clients_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "bills" (
    "id" UUID NOT NULL,
    "bill_number" VARCHAR(40) NOT NULL,
    "type" "BillType" NOT NULL DEFAULT 'SALE',
    "status" "BillStatus" NOT NULL DEFAULT 'PAID',
    "client_id" UUID,
    "customer_name" VARCHAR(120) NOT NULL,
    "customer_phone" VARCHAR(15) NOT NULL,
    "customer_alt_phone" VARCHAR(15),
    "customer_address" VARCHAR(400),
    "customer_gstin" VARCHAR(15),
    "issue_date" DATE NOT NULL,
    "due_date" DATE,
    "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tax_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tax_mode" VARCHAR(16) NOT NULL DEFAULT 'NONE',
    "round_off" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "grand_total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "amount_paid" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "balance_due" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "amount_in_words" VARCHAR(300),
    "payment_mode" VARCHAR(24),
    "payment_note" VARCHAR(200),
    "warranty_template" VARCHAR(48),
    "terms" TEXT[],
    "show_stamp" BOOLEAN NOT NULL DEFAULT true,
    "stamp_text" VARCHAR(40) NOT NULL DEFAULT 'APPROVED / PAID',
    "show_sign" BOOLEAN NOT NULL DEFAULT true,
    "footer_note" VARCHAR(300),
    "public_token" VARCHAR(48) NOT NULL,
    "share_enabled" BOOLEAN NOT NULL DEFAULT true,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "internalNote" TEXT,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "bills_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "bill_items" (
    "id" UUID NOT NULL,
    "bill_id" UUID NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "description" VARCHAR(300) NOT NULL,
    "detail_note" VARCHAR(400),
    "hsn_code" VARCHAR(12),
    "brand" VARCHAR(80),
    "model" VARCHAR(120),
    "serial_number" VARCHAR(80),
    "mrp" DECIMAL(12,2),
    "unit_price" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "quantity" DECIMAL(8,2) NOT NULL DEFAULT 1,
    "line_total" DECIMAL(12,2) NOT NULL DEFAULT 0,

    CONSTRAINT "bill_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "bill_payments" (
    "id" UUID NOT NULL,
    "bill_id" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "mode" VARCHAR(24) NOT NULL DEFAULT 'CASH',
    "paid_on" DATE NOT NULL,
    "reference" VARCHAR(120),
    "note" VARCHAR(200),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bill_payments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "installed_units" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "bill_id" UUID,
    "brand" VARCHAR(80) NOT NULL,
    "model" VARCHAR(120),
    "serial_number" VARCHAR(80),
    "capacity" VARCHAR(40),
    "machine_kind" VARCHAR(20) NOT NULL DEFAULT 'DOMESTIC',
    "installed_on" DATE NOT NULL,
    "parts_warranty_months" INTEGER NOT NULL DEFAULT 12,
    "service_warranty_months" INTEGER NOT NULL DEFAULT 12,
    "parts_warranty_ends_on" DATE,
    "service_warranty_ends_on" DATE,
    "free_services_total" INTEGER NOT NULL DEFAULT 4,
    "free_services_used" INTEGER NOT NULL DEFAULT 0,
    "service_interval_days" INTEGER NOT NULL DEFAULT 90,
    "last_service_on" DATE,
    "next_service_due" DATE,
    "inlet_tds" SMALLINT,
    "outlet_tds" SMALLINT,
    "status" "UnitStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "installed_units_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "amc_records" (
    "id" UUID NOT NULL,
    "contract_number" VARCHAR(40) NOT NULL,
    "client_id" UUID NOT NULL,
    "bill_id" UUID,
    "plan_name" VARCHAR(80) NOT NULL,
    "machine_brand" VARCHAR(80),
    "machine_model" VARCHAR(120),
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "starts_on" DATE NOT NULL,
    "ends_on" DATE NOT NULL,
    "visits_included" INTEGER NOT NULL DEFAULT 4,
    "visits_used" INTEGER NOT NULL DEFAULT 0,
    "last_visit_on" DATE,
    "next_service_due" DATE,
    "covers_filters" BOOLEAN NOT NULL DEFAULT false,
    "covers_membrane" BOOLEAN NOT NULL DEFAULT false,
    "status" "AmcRecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "amc_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "amc_visits" (
    "id" UUID NOT NULL,
    "contract_id" UUID NOT NULL,
    "visit_date" DATE NOT NULL,
    "visitType" VARCHAR(24) NOT NULL DEFAULT 'ROUTINE',
    "technician_name" VARCHAR(120),
    "work_done" TEXT,
    "parts_replaced" VARCHAR(300),
    "extra_charge" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "inlet_tds" SMALLINT,
    "outlet_tds" SMALLINT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "amc_visits_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "billing_clients_phone_key" ON "billing_clients"("phone");

CREATE INDEX IF NOT EXISTS "billing_clients_full_name_idx" ON "billing_clients"("full_name");

CREATE INDEX IF NOT EXISTS "billing_clients_area_idx" ON "billing_clients"("area");

CREATE INDEX IF NOT EXISTS "billing_clients_last_bill_at_idx" ON "billing_clients"("last_bill_at");

CREATE UNIQUE INDEX IF NOT EXISTS "bills_bill_number_key" ON "bills"("bill_number");

CREATE UNIQUE INDEX IF NOT EXISTS "bills_public_token_key" ON "bills"("public_token");

CREATE INDEX IF NOT EXISTS "bills_client_id_idx" ON "bills"("client_id");

CREATE INDEX IF NOT EXISTS "bills_issue_date_idx" ON "bills"("issue_date");

CREATE INDEX IF NOT EXISTS "bills_status_idx" ON "bills"("status");

CREATE INDEX IF NOT EXISTS "bills_customer_phone_idx" ON "bills"("customer_phone");

CREATE INDEX IF NOT EXISTS "bills_type_idx" ON "bills"("type");

CREATE INDEX IF NOT EXISTS "bill_items_bill_id_idx" ON "bill_items"("bill_id");

CREATE INDEX IF NOT EXISTS "bill_payments_bill_id_idx" ON "bill_payments"("bill_id");

CREATE INDEX IF NOT EXISTS "installed_units_client_id_idx" ON "installed_units"("client_id");

CREATE INDEX IF NOT EXISTS "installed_units_next_service_due_idx" ON "installed_units"("next_service_due");

CREATE INDEX IF NOT EXISTS "installed_units_parts_warranty_ends_on_idx" ON "installed_units"("parts_warranty_ends_on");

CREATE INDEX IF NOT EXISTS "installed_units_status_idx" ON "installed_units"("status");

CREATE UNIQUE INDEX IF NOT EXISTS "amc_records_contract_number_key" ON "amc_records"("contract_number");

CREATE INDEX IF NOT EXISTS "amc_records_client_id_idx" ON "amc_records"("client_id");

CREATE INDEX IF NOT EXISTS "amc_records_ends_on_idx" ON "amc_records"("ends_on");

CREATE INDEX IF NOT EXISTS "amc_records_next_service_due_idx" ON "amc_records"("next_service_due");

CREATE INDEX IF NOT EXISTS "amc_records_status_idx" ON "amc_records"("status");

CREATE INDEX IF NOT EXISTS "amc_visits_contract_id_idx" ON "amc_visits"("contract_id");

CREATE INDEX IF NOT EXISTS "amc_visits_visit_date_idx" ON "amc_visits"("visit_date");

DO $$ BEGIN
ALTER TABLE "bills" ADD CONSTRAINT "bills_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "billing_clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
ALTER TABLE "bill_items" ADD CONSTRAINT "bill_items_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
ALTER TABLE "bill_payments" ADD CONSTRAINT "bill_payments_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
ALTER TABLE "installed_units" ADD CONSTRAINT "installed_units_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "billing_clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
ALTER TABLE "installed_units" ADD CONSTRAINT "installed_units_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
ALTER TABLE "amc_records" ADD CONSTRAINT "amc_records_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "billing_clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
ALTER TABLE "amc_records" ADD CONSTRAINT "amc_records_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
ALTER TABLE "amc_visits" ADD CONSTRAINT "amc_visits_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "amc_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
`;

/** Jo tables is module ko chahiye — setup check inhi ko dhoondta hai. */
export const BILLING_TABLES = [
  'billing_clients',
  'bills',
  'bill_items',
  'bill_payments',
  'installed_units',
  'amc_records',
  'amc_visits',
] as const;
