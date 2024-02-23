/*
  Warnings:

  - Added the required column `completionTimeMinutes` to the `QuestionnaireVersion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "QuestionnaireVersion" ADD COLUMN     "completionTimeMinutes" INTEGER NOT NULL;
