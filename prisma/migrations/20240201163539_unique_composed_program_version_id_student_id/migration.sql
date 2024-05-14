/*
  Warnings:

  - A unique constraint covering the columns `[programVersionId,studentId]` on the table `StudentProgram` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "StudentProgram_programVersionId_studentId_key" ON "StudentProgram"("programVersionId", "studentId");
