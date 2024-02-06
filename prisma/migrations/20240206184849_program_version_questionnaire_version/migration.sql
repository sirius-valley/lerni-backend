-- CreateTable
CREATE TABLE "ProgramVersionQuestionnaireVersion" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "programVersionId" TEXT NOT NULL,
    "questionnaireVersionId" TEXT NOT NULL,

    CONSTRAINT "ProgramVersionQuestionnaireVersion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProgramVersionQuestionnaireVersion" ADD CONSTRAINT "ProgramVersionQuestionnaireVersion_programVersionId_fkey" FOREIGN KEY ("programVersionId") REFERENCES "ProgramVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramVersionQuestionnaireVersion" ADD CONSTRAINT "ProgramVersionQuestionnaireVersion_questionnaireVersionId_fkey" FOREIGN KEY ("questionnaireVersionId") REFERENCES "QuestionnaireVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
