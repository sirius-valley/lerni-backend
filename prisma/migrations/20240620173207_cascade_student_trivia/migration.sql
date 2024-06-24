-- DropForeignKey
ALTER TABLE "ResetPasswordToken" DROP CONSTRAINT "ResetPasswordToken_authId_fkey";

-- DropForeignKey
ALTER TABLE "TriviaAnswer" DROP CONSTRAINT "TriviaAnswer_studentTriviaMatchId_fkey";

-- AddForeignKey
ALTER TABLE "ResetPasswordToken" ADD CONSTRAINT "ResetPasswordToken_authId_fkey" FOREIGN KEY ("authId") REFERENCES "Auth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TriviaAnswer" ADD CONSTRAINT "TriviaAnswer_studentTriviaMatchId_fkey" FOREIGN KEY ("studentTriviaMatchId") REFERENCES "StudentTriviaMatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
