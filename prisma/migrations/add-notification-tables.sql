-- Aqua Perl: notification system ke 2 naye table
-- Neon SQL Editor me poora paste karke Run karo.
-- Safe hai: IF NOT EXISTS laga hai, dobara chalao to bhi kuch nahi bigdega.

CREATE TABLE IF NOT EXISTS "admin_alerts" (
    "id" UUID NOT NULL,
    "kind" VARCHAR(40) NOT NULL,
    "priority" VARCHAR(10) NOT NULL DEFAULT 'normal',
    "title" VARCHAR(160) NOT NULL,
    "body" VARCHAR(400) NOT NULL,
    "link" VARCHAR(300),
    "phone" VARCHAR(20),
    "amount" DECIMAL(12,2),
    "related_type" VARCHAR(40),
    "related_id" UUID,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "admin_alerts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "push_subscriptions" (
    "id" UUID NOT NULL,
    "endpoint" VARCHAR(500) NOT NULL,
    "p256dh" VARCHAR(200) NOT NULL,
    "auth" VARCHAR(100) NOT NULL,
    "label" VARCHAR(80),
    "user_id" UUID,
    "last_used" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "admin_alerts_is_read_created_at_idx"
    ON "admin_alerts"("is_read", "created_at");
CREATE INDEX IF NOT EXISTS "admin_alerts_kind_created_at_idx"
    ON "admin_alerts"("kind", "created_at");
CREATE UNIQUE INDEX IF NOT EXISTS "push_subscriptions_endpoint_key"
    ON "push_subscriptions"("endpoint");
