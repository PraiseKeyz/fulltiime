-- CreateTable
CREATE TABLE "team_form" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "opponent_id" TEXT NOT NULL,
    "is_home" BOOLEAN NOT NULL,
    "home_score" INTEGER NOT NULL,
    "away_score" INTEGER NOT NULL,
    "kickoff_at" TIMESTAMP(3) NOT NULL,
    "league_name" TEXT,
    "league_logo" TEXT,

    CONSTRAINT "team_form_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "team_form_team_id_kickoff_at_idx" ON "team_form"("team_id", "kickoff_at");

-- AddForeignKey
ALTER TABLE "team_form" ADD CONSTRAINT "team_form_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_form" ADD CONSTRAINT "team_form_opponent_id_fkey" FOREIGN KEY ("opponent_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
