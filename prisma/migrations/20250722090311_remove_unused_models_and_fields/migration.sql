/*
  Warnings:

  - You are about to drop the column `bankAccount` on the `entrepreneur_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `entrepreneur_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `entrepreneur_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `taxId` on the `entrepreneur_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `entrepreneur_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `portfolio_images` table. All the data in the column will be lost.
  - You are about to drop the `reviews` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subscription_plans` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subscriptions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_planId_fkey";

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_userId_fkey";

-- AlterTable
ALTER TABLE "entrepreneur_profiles" DROP COLUMN "bankAccount",
DROP COLUMN "latitude",
DROP COLUMN "longitude",
DROP COLUMN "taxId",
DROP COLUMN "website";

-- AlterTable
ALTER TABLE "portfolio_images" DROP COLUMN "order";

-- DropTable
DROP TABLE "reviews";

-- DropTable
DROP TABLE "subscription_plans";

-- DropTable
DROP TABLE "subscriptions";

-- DropEnum
DROP TYPE "SubscriptionStatus";
