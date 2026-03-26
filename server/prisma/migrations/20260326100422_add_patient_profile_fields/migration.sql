/*
  Warnings:

  - A unique constraint covering the columns `[patientKey]` on the table `Patient` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN "patientKey" TEXT;
ALTER TABLE "Appointment" ADD COLUMN "patientName" TEXT;

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN "allergies" TEXT;
ALTER TABLE "Patient" ADD COLUMN "chronicConditions" TEXT;
ALTER TABLE "Patient" ADD COLUMN "location" TEXT;
ALTER TABLE "Patient" ADD COLUMN "medications" TEXT;
ALTER TABLE "Patient" ADD COLUMN "notes" TEXT;
ALTER TABLE "Patient" ADD COLUMN "patientKey" TEXT;
ALTER TABLE "Patient" ADD COLUMN "phone" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Patient_patientKey_key" ON "Patient"("patientKey");
