-- AlterTable
ALTER TABLE "notifications" RENAME COLUMN "read" TO "is_read";

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN "sent_at" TIMESTAMP(3);