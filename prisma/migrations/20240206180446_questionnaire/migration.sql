/*
  Warnings:

  - You are about to drop the column `isCorrect` on the `PillAnswer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PillAnswer" DROP COLUMN "isCorrect";

-- CreateTable
CREATE TABLE "Questionnaire" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Questionnaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionnaireVersion" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "passsing_score" INTEGER NOT NULL,
    "cooldownInMinutes" INTEGER NOT NULL,
    "block" TEXT NOT NULL,
    "questionCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "questionnaireId" TEXT NOT NULL,

    CONSTRAINT "QuestionnaireVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionnaireSubmission" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedDateTime" TIMESTAMP(3) NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "studentId" TEXT NOT NULL,
    "questionnaireVersionId" TEXT NOT NULL,

    CONSTRAINT "QuestionnaireSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionnaireAnswer" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "questionnaireSubmissionId" TEXT NOT NULL,

    CONSTRAINT "QuestionnaireAnswer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuestionnaireVersion" ADD CONSTRAINT "QuestionnaireVersion_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES "Questionnaire"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionnaireSubmission" ADD CONSTRAINT "QuestionnaireSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionnaireSubmission" ADD CONSTRAINT "QuestionnaireSubmission_questionnaireVersionId_fkey" FOREIGN KEY ("questionnaireVersionId") REFERENCES "QuestionnaireVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionnaireAnswer" ADD CONSTRAINT "QuestionnaireAnswer_questionnaireSubmissionId_fkey" FOREIGN KEY ("questionnaireSubmissionId") REFERENCES "QuestionnaireSubmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
