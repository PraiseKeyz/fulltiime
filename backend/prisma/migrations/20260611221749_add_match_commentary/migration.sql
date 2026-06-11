-- CreateTable
CREATE TABLE "match_commentaries" (
    "id" TEXT NOT NULL,
    "sportmonks_id" BIGINT NOT NULL,
    "match_id" TEXT NOT NULL,
    "minute" INTEGER,
    "extra_minute" INTEGER,
    "comment" TEXT NOT NULL,
    "is_goal" BOOLEAN NOT NULL DEFAULT false,
    "is_important" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "player_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_commentaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "match_commentaries_sportmonks_id_key" ON "match_commentaries"("sportmonks_id");

-- CreateIndex
CREATE INDEX "match_commentaries_match_id_order_idx" ON "match_commentaries"("match_id", "order");

-- AddForeignKey
ALTER TABLE "match_commentaries" ADD CONSTRAINT "match_commentaries_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
