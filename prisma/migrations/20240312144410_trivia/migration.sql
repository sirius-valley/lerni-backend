-- CreateTable
CREATE TABLE "Trivia" (
    "id" TEXT NOT NULL,
    "block" TEXT NOT NULL,
    "questionCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trivia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramVersionTrivia" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "programVersionId" TEXT NOT NULL,
    "triviaId" TEXT NOT NULL,

    CONSTRAINT "ProgramVersionTrivia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TriviaMatch" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedDateTime" TIMESTAMP(3),
    "triviaId" TEXT NOT NULL,

    CONSTRAINT "TriviaMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentTriviaMatch" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "studentId" TEXT NOT NULL,
    "triviaMatchId" TEXT NOT NULL,

    CONSTRAINT "StudentTriviaMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TriviaAnswer" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "studentTriviaMatchId" TEXT NOT NULL,

    CONSTRAINT "TriviaAnswer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProgramVersionTrivia" ADD CONSTRAINT "ProgramVersionTrivia_programVersionId_fkey" FOREIGN KEY ("programVersionId") REFERENCES "ProgramVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramVersionTrivia" ADD CONSTRAINT "ProgramVersionTrivia_triviaId_fkey" FOREIGN KEY ("triviaId") REFERENCES "Trivia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TriviaMatch" ADD CONSTRAINT "TriviaMatch_triviaId_fkey" FOREIGN KEY ("triviaId") REFERENCES "Trivia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentTriviaMatch" ADD CONSTRAINT "StudentTriviaMatch_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentTriviaMatch" ADD CONSTRAINT "StudentTriviaMatch_triviaMatchId_fkey" FOREIGN KEY ("triviaMatchId") REFERENCES "TriviaMatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TriviaAnswer" ADD CONSTRAINT "TriviaAnswer_studentTriviaMatchId_fkey" FOREIGN KEY ("studentTriviaMatchId") REFERENCES "StudentTriviaMatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
