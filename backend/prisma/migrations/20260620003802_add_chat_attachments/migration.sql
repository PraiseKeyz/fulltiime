-- CreateEnum
CREATE TYPE "ChatAttachmentType" AS ENUM ('IMAGE', 'AUDIO');

-- AlterTable
ALTER TABLE "live_chat_messages" ADD COLUMN     "attachment_duration" INTEGER,
ADD COLUMN     "attachment_type" "ChatAttachmentType",
ADD COLUMN     "attachment_url" TEXT;
