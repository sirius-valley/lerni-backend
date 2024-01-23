/*
  Warnings:

  - You are about to drop the column `ciudad` on the `Student` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Student" DROP COLUMN "ciudad",
ADD COLUMN     "city" TEXT;
