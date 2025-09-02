/*
  Warnings:

  - You are about to drop the column `amount` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `paidAt` on the `payments` table. All the data in the column will be lost.
  - Added the required column `depositAmount` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceAmount` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipAmount` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('FULL_PAYMENT', 'DEPOSIT', 'REMAINING_BALANCE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentStatus" ADD VALUE 'PARTIALLY_REFUNDED';
ALTER TYPE "PaymentStatus" ADD VALUE 'CANCELLED';
ALTER TYPE "PaymentStatus" ADD VALUE 'DISPUTED';

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_entrepreneurId_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_entrepreneurId_fkey";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "amount",
DROP COLUMN "paidAt",
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "depositAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "isFullPayment" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "netAmount" DOUBLE PRECISION,
ADD COLUMN     "paymentType" "PaymentType" NOT NULL DEFAULT 'DEPOSIT',
ADD COLUMN     "platformFee" DOUBLE PRECISION,
ADD COLUMN     "platformFeeRate" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
ADD COLUMN     "processingFee" DOUBLE PRECISION,
ADD COLUMN     "refundAmount" DOUBLE PRECISION,
ADD COLUMN     "refundReason" TEXT,
ADD COLUMN     "serviceAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "tipAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "transactionId" TEXT;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_entrepreneurId_fkey" FOREIGN KEY ("entrepreneurId") REFERENCES "entrepreneur_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_entrepreneurId_fkey" FOREIGN KEY ("entrepreneurId") REFERENCES "entrepreneur_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
