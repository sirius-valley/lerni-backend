-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_authId_fkey";

-- AlterTable
ALTER TABLE "Student" ALTER COLUMN "authId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_authId_fkey" FOREIGN KEY ("authId") REFERENCES "Auth"("id") ON DELETE SET NULL ON UPDATE CASCADE;
