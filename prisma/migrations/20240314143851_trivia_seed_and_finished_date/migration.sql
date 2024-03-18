-- AlterTable
ALTER TABLE "StudentTriviaMatch" ADD COLUMN     "finishedDateTime" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Trivia" ALTER COLUMN "questionCount" SET DEFAULT 12;

-- AlterTable
ALTER TABLE "TriviaMatch" ADD COLUMN     "seed" INTEGER NOT NULL DEFAULT 0;
