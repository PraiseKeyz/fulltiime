-- Remove double opt-in. Any lingering PENDING subscribers must be migrated
-- before the enum is shrunk (belt-and-suspenders — the app already flipped
-- the one real PENDING row to CONFIRMED ahead of this migration).
UPDATE "newsletter_subscribers" SET "status" = 'CONFIRMED', "confirmed_at" = COALESCE("confirmed_at", CURRENT_TIMESTAMP) WHERE "status" = 'PENDING';

-- Drop the confirm-token columns — single opt-in never uses them.
ALTER TABLE "newsletter_subscribers" DROP COLUMN "confirm_token";
ALTER TABLE "newsletter_subscribers" DROP COLUMN "confirm_expires";

-- Shrink the enum: PENDING is no longer a valid value.
ALTER TABLE "newsletter_subscribers" ALTER COLUMN "status" DROP DEFAULT;
CREATE TYPE "SubscriberStatus_new" AS ENUM ('CONFIRMED', 'UNSUBSCRIBED');
ALTER TABLE "newsletter_subscribers" ALTER COLUMN "status" TYPE "SubscriberStatus_new" USING ("status"::text::"SubscriberStatus_new");
ALTER TYPE "SubscriberStatus" RENAME TO "SubscriberStatus_old";
ALTER TYPE "SubscriberStatus_new" RENAME TO "SubscriberStatus";
DROP TYPE "SubscriberStatus_old";
ALTER TABLE "newsletter_subscribers" ALTER COLUMN "status" SET DEFAULT 'CONFIRMED';
