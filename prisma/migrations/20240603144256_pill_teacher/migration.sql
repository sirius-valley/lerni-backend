-- AlterTable
ALTER TABLE "Pill" ADD COLUMN     "teacherId" TEXT;

-- AddForeignKey
ALTER TABLE "Pill" ADD CONSTRAINT "Pill_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
