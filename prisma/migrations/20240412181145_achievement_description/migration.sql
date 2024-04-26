/*
  Warnings:

  - Added the required column `description` to the `Achievement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Achievement" ADD COLUMN     "description" TEXT NOT NULL;
