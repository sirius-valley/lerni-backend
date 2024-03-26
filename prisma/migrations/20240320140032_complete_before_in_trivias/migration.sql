-- AlterTable
ALTER TABLE "StudentTriviaMatch" ADD COLUMN     "completeBefore" TIMESTAMP(3) NOT NULL DEFAULT NOW() + INTERVAL '72 hours';
