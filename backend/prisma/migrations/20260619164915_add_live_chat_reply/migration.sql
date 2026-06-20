-- AlterTable
ALTER TABLE "live_chat_messages" ADD COLUMN     "reply_to_id" TEXT;

-- AddForeignKey
ALTER TABLE "live_chat_messages" ADD CONSTRAINT "live_chat_messages_reply_to_id_fkey" FOREIGN KEY ("reply_to_id") REFERENCES "live_chat_messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
