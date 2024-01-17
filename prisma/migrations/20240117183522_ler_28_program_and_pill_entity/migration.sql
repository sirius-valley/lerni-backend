-- CreateEnum
CREATE TYPE "PointEvent" AS ENUM ('added', 'subtracted');

-- CreateEnum
CREATE TYPE "Privacy" AS ENUM ('public', 'private');

-- CreateEnum
CREATE TYPE "Vote" AS ENUM ('up', 'down');

-- CreateTable
CREATE TABLE "Teacher" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "profession" TEXT NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointLog" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "detail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "studentId" TEXT NOT NULL,

    CONSTRAINT "PointLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hoursToComplete" INTEGER NOT NULL,
    "pointsReward" INTEGER NOT NULL,
    "icon" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "teacherId" TEXT NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "privacy" "Privacy" NOT NULL,
    "vote" "Vote" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "studentId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramVersion" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "programId" TEXT NOT NULL,

    CONSTRAINT "ProgramVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProgram" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "studentId" TEXT NOT NULL,
    "programVersionId" TEXT NOT NULL,

    CONSTRAINT "StudentProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PorgramObjective" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "programVersionId" TEXT NOT NULL,

    CONSTRAINT "PorgramObjective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "teacherComment" TEXT NOT NULL,

    CONSTRAINT "Pill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PillVersion" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "completionTimeMinutes" INTEGER NOT NULL,
    "block" TEXT NOT NULL,
    "questionCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pillId" TEXT NOT NULL,

    CONSTRAINT "PillVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PillObjective" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pillVersionId" TEXT NOT NULL,

    CONSTRAINT "PillObjective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramVersionPillVersion" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "programVersionId" TEXT NOT NULL,
    "pillVersionId" TEXT NOT NULL,

    CONSTRAINT "ProgramVersionPillVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PillSubmission" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "studentId" TEXT NOT NULL,
    "pillVersionId" TEXT NOT NULL,

    CONSTRAINT "PillSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PillAnswer" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pillSubmissionId" TEXT NOT NULL,

    CONSTRAINT "PillAnswer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PointLog" ADD CONSTRAINT "PointLog_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramVersion" ADD CONSTRAINT "ProgramVersion_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProgram" ADD CONSTRAINT "StudentProgram_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProgram" ADD CONSTRAINT "StudentProgram_programVersionId_fkey" FOREIGN KEY ("programVersionId") REFERENCES "ProgramVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PorgramObjective" ADD CONSTRAINT "PorgramObjective_programVersionId_fkey" FOREIGN KEY ("programVersionId") REFERENCES "ProgramVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PillVersion" ADD CONSTRAINT "PillVersion_pillId_fkey" FOREIGN KEY ("pillId") REFERENCES "Pill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PillObjective" ADD CONSTRAINT "PillObjective_pillVersionId_fkey" FOREIGN KEY ("pillVersionId") REFERENCES "PillVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramVersionPillVersion" ADD CONSTRAINT "ProgramVersionPillVersion_programVersionId_fkey" FOREIGN KEY ("programVersionId") REFERENCES "ProgramVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramVersionPillVersion" ADD CONSTRAINT "ProgramVersionPillVersion_pillVersionId_fkey" FOREIGN KEY ("pillVersionId") REFERENCES "PillVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PillSubmission" ADD CONSTRAINT "PillSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PillSubmission" ADD CONSTRAINT "PillSubmission_pillVersionId_fkey" FOREIGN KEY ("pillVersionId") REFERENCES "PillVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PillAnswer" ADD CONSTRAINT "PillAnswer_pillSubmissionId_fkey" FOREIGN KEY ("pillSubmissionId") REFERENCES "PillSubmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
