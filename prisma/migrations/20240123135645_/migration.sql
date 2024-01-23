/*
  Warnings:

  - You are about to drop the column `questionCount` on the `PillVersion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PillAnswer" ADD COLUMN     "isCorrect" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "PillVersion" DROP COLUMN "questionCount";
