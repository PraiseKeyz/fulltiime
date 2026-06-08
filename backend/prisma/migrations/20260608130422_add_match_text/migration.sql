/*
  Warnings:

  - A unique constraint covering the columns `[verification_token]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[reset_token]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "MatchTextKind" AS ENUM ('PREVIEW', 'OVERVIEW', 'ABOUT', 'REPORT', 'INFO');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "reset_expires" TIMESTAMP(3),
ADD COLUMN     "reset_token" TEXT,
ADD COLUMN     "verification_expires" TIMESTAMP(3),
ADD COLUMN     "verification_token" TEXT;

-- CreateTable
CREATE TABLE "match_texts" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "kind" "MatchTextKind" NOT NULL,
    "body" TEXT NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_texts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "match_texts_match_id_kind_key" ON "match_texts"("match_id", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "users_verification_token_key" ON "users"("verification_token");

-- CreateIndex
CREATE UNIQUE INDEX "users_reset_token_key" ON "users"("reset_token");

-- AddForeignKey
ALTER TABLE "match_texts" ADD CONSTRAINT "match_texts_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
