/*
  Warnings:

  - You are about to drop the `PointLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PointLog" DROP CONSTRAINT "PointLog_studentId_fkey";

-- DropTable
DROP TABLE "PointLog";

-- CreateTable
CREATE TABLE "PointRecord"
(
    "id"           TEXT         NOT NULL,
    "amount"       INTEGER      NOT NULL,
    "sourceEntity" TEXT         NOT NULL,
    "entityId"     TEXT         NOT NULL,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "studentId"    TEXT         NOT NULL,

    CONSTRAINT "PointRecord_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PointRecord"
    ADD CONSTRAINT "PointRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
