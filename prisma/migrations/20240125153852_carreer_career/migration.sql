/*
  Warnings:

  - You are about to drop the column `carreer` on the `Student` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Student" DROP COLUMN "carreer",
ADD COLUMN     "career" TEXT;
