/*
  Warnings:

  - You are about to drop the column `marksVerified` on the `Student` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "MarksStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "marksVerified",
ADD COLUMN     "marksStatus" "MarksStatus" NOT NULL DEFAULT 'PENDING';
