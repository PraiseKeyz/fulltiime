-- AlterTable
ALTER TABLE "matches" ADD COLUMN     "venue_id" TEXT;

-- CreateTable
CREATE TABLE "venues" (
    "id" TEXT NOT NULL,
    "sportmonks_id" INTEGER,
    "name" TEXT NOT NULL,
    "city" TEXT,
    "country" TEXT,
    "address" TEXT,
    "capacity" INTEGER,
    "surface" TEXT,
    "image_url" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "venues_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "venues_sportmonks_id_key" ON "venues"("sportmonks_id");

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE SET NULL ON UPDATE CASCADE;
