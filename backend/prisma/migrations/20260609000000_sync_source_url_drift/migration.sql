-- AlterTable
ALTER TABLE "articles" ADD COLUMN "source_url" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "articles_source_url_key" ON "articles"("source_url");
