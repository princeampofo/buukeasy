/*
  Warnings:

  - The values [TRIALING] on the enum `SubscriptionStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [CUSTOMER] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `customerId` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `emailDailyReminders` on the `notification_settings` table. All the data in the column will be lost.
  - You are about to drop the column `emailMarketingPromotions` on the `notification_settings` table. All the data in the column will be lost.
  - You are about to drop the column `emailNewBookings` on the `notification_settings` table. All the data in the column will be lost.
  - You are about to drop the column `emailWeeklyReports` on the `notification_settings` table. All the data in the column will be lost.
  - You are about to drop the column `smsNewBookings` on the `notification_settings` table. All the data in the column will be lost.
  - You are about to drop the column `customerId` on the `reviews` table. All the data in the column will be lost.
  - The `features` column on the `subscription_plans` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `nextBillingDate` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethodId` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSubscriptionId` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the `invoices` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `customerEmail` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerName` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerEmail` to the `reviews` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerName` to the `reviews` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SubscriptionStatus_new" AS ENUM ('ACTIVE', 'CANCELED', 'PAST_DUE', 'UNPAID');
ALTER TABLE "subscriptions" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "subscriptions" ALTER COLUMN "status" TYPE "SubscriptionStatus_new" USING ("status"::text::"SubscriptionStatus_new");
ALTER TYPE "SubscriptionStatus" RENAME TO "SubscriptionStatus_old";
ALTER TYPE "SubscriptionStatus_new" RENAME TO "SubscriptionStatus";
DROP TYPE "SubscriptionStatus_old";
ALTER TABLE "subscriptions" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('ENTREPRENEUR', 'ADMIN');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'ENTREPRENEUR';
COMMIT;

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_customerId_fkey";

-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_customerId_fkey";

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_userId_fkey";

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "customerId",
ADD COLUMN     "customerEmail" TEXT NOT NULL,
ADD COLUMN     "customerName" TEXT NOT NULL,
ADD COLUMN     "customerPhone" TEXT;

-- AlterTable
ALTER TABLE "notification_settings" DROP COLUMN "emailDailyReminders",
DROP COLUMN "emailMarketingPromotions",
DROP COLUMN "emailNewBookings",
DROP COLUMN "emailWeeklyReports",
DROP COLUMN "smsNewBookings",
ADD COLUMN     "emailBookings" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "emailReminders" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "marketingEmails" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "smsBookings" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "weeklyReports" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "reviews" DROP COLUMN "customerId",
ADD COLUMN     "customerEmail" TEXT NOT NULL,
ADD COLUMN     "customerName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "subscription_plans" DROP COLUMN "features",
ADD COLUMN     "features" TEXT[];

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "nextBillingDate",
DROP COLUMN "paymentMethodId",
DROP COLUMN "stripeSubscriptionId";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'ENTREPRENEUR';

-- DropTable
DROP TABLE "invoices";

-- DropEnum
DROP TYPE "InvoiceStatus";

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
