-- AlterTable
ALTER TABLE "subscription_link" ADD COLUMN     "block_ads" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "routing_updated_at" TIMESTAMPTZ(3),
ADD COLUMN     "ru_direct" BOOLEAN NOT NULL DEFAULT true;
