/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `entrepreneur_profiles` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "entrepreneur_profiles" ADD COLUMN     "slug" TEXT,
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "city" DROP NOT NULL,
ALTER COLUMN "state" DROP NOT NULL,
ALTER COLUMN "zipCode" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "entrepreneur_profiles_slug_key" ON "entrepreneur_profiles"("slug");

-- Update existing records with slugs based on business name
UPDATE "entrepreneur_profiles"
SET "slug" = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      "businessName",
      '[^a-zA-Z0-9]+',
      '-'
    ),
    '^-+|-+$',
    ''
  )
);
