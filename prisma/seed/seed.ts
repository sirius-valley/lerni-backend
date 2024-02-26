import { PrismaClient } from '@prisma/client';
import { introductionID } from '../../src/const';
import {
  authId,
  introductionBlock,
  pillBlock,
  pillId,
  pillVersionId,
  programId,
  programVersionId,
  programVersionPillVersionId,
  programVersionQuestionnaireVersionId,
  questionnaireBlock,
  questionnaireId,
  questionnaireVersionId,
  studentId,
  studentProgramId,
  teacherId,
} from './const';

const prisma = new PrismaClient();

async function main() {
  await prisma.pillVersion.upsert({
    where: { id: introductionID },
    update: {
      block: introductionBlock,
      version: 1,
      completionTimeMinutes: 5,
      pill: {
        update: {
          name: 'Introducción',
          description: 'Introducción',
          teacherComment: 'Esta es la píldora de introducción, es un buen lugar para comenzar.',
        },
      },
    },
    create: {
      id: introductionID,
      block: introductionBlock,
      version: 1,
      completionTimeMinutes: 5,
      pill: {
        connectOrCreate: {
          where: { id: introductionID },
          create: {
            id: introductionID,
            name: 'Introducción',
            description: 'Introducción',
            teacherComment: 'Esta es la píldora de introducción, es un buen lugar para comenzar.',
          },
        },
      },
    },
  });

  await prisma.program.upsert({
    where: { id: programId },
    update: {
      name: 'Programa de prueba',
      icon: 'imagen',
      hoursToComplete: 10,
      pointsReward: 100,
      teacher: {
        connectOrCreate: {
          where: { id: teacherId },
          create: {
            id: teacherId,
            name: 'Teacher',
            lastname: 'Teacher',
            email: 'teacher@mail.com',
            password: 'password',
            profession: 'Profesor',
          },
        },
      },
    },
    create: {
      id: programId,
      name: 'Programa de prueba',
      icon: 'imagen',
      hoursToComplete: 10,
      pointsReward: 100,
      teacher: {
        connectOrCreate: {
          where: { id: teacherId },
          create: {
            id: teacherId,
            name: 'Teacher',
            lastname: 'Teacher',
            email: 'teacher@mail.com',
            password: 'password',
            profession: 'Profesor',
          },
        },
      },
    },
  });

  await prisma.programVersion.upsert({
    where: { id: programVersionId },
    update: {
      programId: programId,
      version: 1,
    },
    create: {
      id: programVersionId,
      programId: programId,
      version: 1,
    },
  });

  await prisma.pill.upsert({
    where: { id: pillId },
    update: {
      name: 'Prueba',
      description: 'Prueba',
      teacherComment: 'Esta es la píldora de prueba, es un buen lugar para comenzar.',
    },
    create: {
      id: pillId,
      name: 'Prueba',
      description: 'Prueba',
      teacherComment: 'Esta es la píldora de prueba, es un buen lugar para comenzar.',
    },
  });

  await prisma.pillVersion.upsert({
    where: { id: pillVersionId },
    update: {
      block: pillBlock,
      version: 1,
      completionTimeMinutes: 5,
      pillId: pillId,
    },
    create: {
      id: pillVersionId,
      block: pillBlock,
      version: 1,
      completionTimeMinutes: 5,
      pillId: pillId,
    },
  });

  await prisma.programVersionPillVersion.upsert({
    where: { id: programVersionPillVersionId },
    update: {
      programVersionId: programVersionId,
      pillVersionId: pillVersionId,
      order: 1,
    },
    create: {
      id: programVersionPillVersionId,
      programVersionId: programVersionId,
      pillVersionId: pillVersionId,
      order: 1,
    },
  });

  await prisma.auth.upsert({
    where: { id: authId },
    update: {
      email: 'monosteve123@gmail.com',
      password: '$2b$10$8mYwGBbOvUJEx63DYIZc0.NQdFyW9x0jcctuKk/D7G0gmCuwaAnrO',
    },
    create: {
      id: authId,
      email: 'monosteve123@gmail.com',
      password: '$2b$10$8mYwGBbOvUJEx63DYIZc0.NQdFyW9x0jcctuKk/D7G0gmCuwaAnrO',
    },
  });

  await prisma.student.upsert({
    where: { id: studentId },
    update: {
      name: 'John',
      lastname: 'Doe',
      career: 'Computer Science',
      city: 'New York',
      auth: {
        connect: {
          id: authId,
        },
      },
    },
    create: {
      id: studentId,
      name: 'John',
      lastname: 'Doe',
      career: 'Computer Science',
      city: 'New York',
      auth: {
        connect: {
          id: authId,
        },
      },
    },
  });
  await prisma.studentProgram.upsert({
    where: { id: studentProgramId },
    update: {
      studentId: studentId,
      programVersionId: programVersionId,
    },
    create: {
      id: studentProgramId,
      studentId: studentId,
      programVersionId: programVersionId,
    },
  });

  await prisma.questionnaire.upsert({
    where: { id: questionnaireId },
    update: {
      name: 'Cuestionario de prueba',
      description: 'Cuestionario de prueba',
    },
    create: {
      id: questionnaireId,
      name: 'Cuestionario de prueba',
      description: 'Cuestionario de prueba',
    },
  });

  await prisma.questionnaireVersion.upsert({
    where: { id: questionnaireVersionId },
    update: {
      questionnaireId: questionnaireId,
      version: 1,
    },
    create: {
      id: questionnaireVersionId,
      questionnaireId: questionnaireId,
      completionTimeMinutes: 5,
      cooldownInMinutes: 10,
      block: questionnaireBlock,
      questionCount: 3,
      passsing_score: 50,
      version: 1,
    },
  });

  await prisma.programVersionQuestionnaireVersion.upsert({
    where: { id: programVersionQuestionnaireVersionId },
    update: {
      programVersionId: programVersionId,
      questionnaireVersionId: questionnaireVersionId,
      order: 1,
    },
    create: {
      id: programVersionQuestionnaireVersionId,
      programVersionId: programVersionId,
      questionnaireVersionId: questionnaireVersionId,
      order: 1,
    },
  });
}

main()

  .then(async () => {

    await prisma.$disconnect();

  })

  .catch(async (e) => {

    console.error(e);

    await prisma.$disconnect();

    process.exit(1);

  });
