/*
  Warnings:

  - You are about to drop the column `entrepreneurFee` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `platformFee` on the `payments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "payments" DROP COLUMN "entrepreneurFee",
DROP COLUMN "platformFee";
