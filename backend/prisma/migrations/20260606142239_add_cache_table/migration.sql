-- CreateTable
CREATE TABLE "cache" (
    "key" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cache_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "cache_expires_at_idx" ON "cache"("expires_at");
