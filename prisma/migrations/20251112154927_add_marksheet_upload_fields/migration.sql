-- CreateEnum
CREATE TYPE "SeatStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "marksVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "marksheetUrl" TEXT,
ADD COLUMN     "seatStatus" "SeatStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "seatAccepted" DROP NOT NULL,
ALTER COLUMN "seatAccepted" DROP DEFAULT;
