-- Remove the retired editorial sections (NEWS, TACTICS, LALIGA).
-- Verified before writing this: zero articles reference these values, so the
-- cast below cannot fail on existing data.

-- The NEWS default is gone from the schema; drop it before the type swap.
ALTER TABLE "articles" ALTER COLUMN "section" DROP DEFAULT;

-- Postgres can't remove enum values in place — create the trimmed type,
-- cast the column over, then drop the old type.
CREATE TYPE "Section_new" AS ENUM ('TRANSFERS', 'WORLDCUP', 'PREMIER', 'CHAMPIONS', 'TV', 'BEYOND', 'MOTHERLAND');
ALTER TABLE "articles" ALTER COLUMN "section" TYPE "Section_new" USING ("section"::text::"Section_new");
ALTER TYPE "Section" RENAME TO "Section_old";
ALTER TYPE "Section_new" RENAME TO "Section";
DROP TYPE "Section_old";
