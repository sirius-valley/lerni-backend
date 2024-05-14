/*
  Warnings:

  - You are about to drop the `PorgramObjective` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PorgramObjective" DROP CONSTRAINT "PorgramObjective_programVersionId_fkey";

-- DropTable
DROP TABLE "PorgramObjective";

-- CreateTable
CREATE TABLE "ProgramObjective" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "programVersionId" TEXT NOT NULL,

    CONSTRAINT "ProgramObjective_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProgramObjective" ADD CONSTRAINT "ProgramObjective_programVersionId_fkey" FOREIGN KEY ("programVersionId") REFERENCES "ProgramVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
