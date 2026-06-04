/*
  Warnings:

  - A unique constraint covering the columns `[sportmonks_id]` on the table `match_events` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "match_events" ADD COLUMN     "extra_minute" INTEGER,
ADD COLUMN     "related_player_name" TEXT,
ADD COLUMN     "sort_order" INTEGER,
ADD COLUMN     "sportmonks_id" INTEGER;

-- AlterTable
ALTER TABLE "matches" ADD COLUMN     "away_formation" TEXT,
ADD COLUMN     "home_formation" TEXT;

-- CreateTable
CREATE TABLE "match_lineups" (
    "id" TEXT NOT NULL,
    "sportmonks_id" INTEGER,
    "match_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "player_name" TEXT NOT NULL,
    "player_photo" TEXT,
    "jersey_number" INTEGER,
    "position" TEXT,
    "formation_field" TEXT,
    "is_starting" BOOLEAN NOT NULL DEFAULT true,
    "sportmonks_player_id" INTEGER,

    CONSTRAINT "match_lineups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "match_lineups_sportmonks_id_key" ON "match_lineups"("sportmonks_id");

-- CreateIndex
CREATE UNIQUE INDEX "match_events_sportmonks_id_key" ON "match_events"("sportmonks_id");

-- AddForeignKey
ALTER TABLE "match_lineups" ADD CONSTRAINT "match_lineups_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_lineups" ADD CONSTRAINT "match_lineups_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
