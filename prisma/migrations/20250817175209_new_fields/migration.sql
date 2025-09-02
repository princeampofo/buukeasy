/*
  Warnings:

  - You are about to drop the column `price` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `requireDeposit` on the `services` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "services" DROP COLUMN "price",
DROP COLUMN "requireDeposit",
ADD COLUMN     "homeServiceDeposit" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "homeServicePrice" DOUBLE PRECISION,
ADD COLUMN     "inStoreServiceDeposit" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "inStoreServicePrice" DOUBLE PRECISION,
ADD COLUMN     "offersHomeService" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "offersInStoreService" BOOLEAN NOT NULL DEFAULT false;
