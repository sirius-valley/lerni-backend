-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "trackedValue" TEXT NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AchievementLevel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetValue" INTEGER NOT NULL,
    "pointsAwarded" INTEGER NOT NULL,
    "icon" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,

    CONSTRAINT "AchievementLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentAchievementLevel" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "studentId" TEXT NOT NULL,
    "achievementLevelId" TEXT NOT NULL,

    CONSTRAINT "StudentAchievementLevel_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AchievementLevel" ADD CONSTRAINT "AchievementLevel_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAchievementLevel" ADD CONSTRAINT "StudentAchievementLevel_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAchievementLevel" ADD CONSTRAINT "StudentAchievementLevel_achievementLevelId_fkey" FOREIGN KEY ("achievementLevelId") REFERENCES "AchievementLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
