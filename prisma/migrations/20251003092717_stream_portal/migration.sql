-- CreateEnum
CREATE TYPE "ReceiptStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "branchChoice1" TEXT NOT NULL,
    "branchChoice2" TEXT NOT NULL,
    "seatAllotted" TEXT,
    "seatAccepted" BOOLEAN NOT NULL DEFAULT false,
    "receiptUrl" TEXT,
    "receiptStatus" "ReceiptStatus" NOT NULL DEFAULT 'PENDING',
    "offerLetterUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notification" TEXT,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Class10Marks" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "math" INTEGER NOT NULL,
    "science" INTEGER NOT NULL,
    "english" INTEGER NOT NULL,
    "hindi" INTEGER NOT NULL,
    "social" INTEGER NOT NULL,

    CONSTRAINT "Class10Marks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Class12Marks" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "physics" INTEGER NOT NULL,
    "chemistry" INTEGER NOT NULL,
    "math" INTEGER NOT NULL,

    CONSTRAINT "Class12Marks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_userId_key" ON "Student"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Class10Marks_studentId_key" ON "Class10Marks"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Class12Marks_studentId_key" ON "Class12Marks"("studentId");

-- AddForeignKey
ALTER TABLE "Class10Marks" ADD CONSTRAINT "Class10Marks_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class12Marks" ADD CONSTRAINT "Class12Marks_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
