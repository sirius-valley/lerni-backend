/*
  Warnings:

  - You are about to drop the column `profesion` on the `Student` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Student" DROP COLUMN "profesion",
ADD COLUMN     "profession" TEXT;
