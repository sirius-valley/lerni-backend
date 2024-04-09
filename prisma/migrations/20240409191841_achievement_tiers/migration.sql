/*
  Warnings:

  - You are about to drop the column `description` on the `Achievement` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `AchievementLevel` table. All the data in the column will be lost.
  - Added the required column `tier` to the `AchievementLevel` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AchievementTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'DIAMOND');

-- AlterTable
ALTER TABLE "Achievement" DROP COLUMN "description";

-- AlterTable
ALTER TABLE "AchievementLevel" DROP COLUMN "name",
ADD COLUMN     "tier" "AchievementTier" NOT NULL;
