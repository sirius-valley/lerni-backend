import { PrismaClient } from '@prisma/client';
import { introductionID } from '../../src/const';
import {
  authId,
  FractureB2Block,
  FractureB2PillId1,
  FractureB2PillVersionId1,
  FractureB2ProgramVersionPillVersionId1,
  FractureClassificationBlock,
  FractureClassificationPillId1,
  FractureClassificationPillVersionId1,
  FractureClassificationProgramVersionPillVersionId1,
  FractureIntroductionBlock,
  FracturePillId1,
  FracturePillVersionId1,
  FractureProgramId,
  FractureProgramVersionId,
  FractureProgramVersionPillVersionId1,
  FractureProgramVersionQuestionnaireVersionId,
  FractureQuestionnaireId,
  FractureQuestionnaireVersionId,
  FractureStudentProgramId,
  introductionBlock,
  maleTeacherId,
  NICBlock,
  NICPillId1,
  NICPillVersionId1,
  NICProgramVersionId,
  NICprogramVersionPillVersionId1,
  NICprogramVersionQuestionnaireVersionId,
  NICQuestionnaire,
  NICQuestionnaireId,
  NICQuestionnaireVersionId,
  NICstudentProgramId,
  pillBlock,
  pillId,
  pillVersionId,
  programId,
  programIdNIC,
  programVersionId,
  programVersionPillVersionId,
  programVersionQuestionnaireVersionId,
  programVersionTrivia,
  questionnaireBlock,
  questionnaireId,
  questionnaireVersionId,
  studentId,
  studentProgramId,
  studentTriviaMatchId,
  teacherId,
  triviaBlock,
  triviaId,
  triviaMatchId,
  walterTeacherId,
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
      name: 'Programa para probar los componentes',
      icon: 'https://lerni-images-2024.s3.amazonaws.com/pillimage1.png',
      hoursToComplete: 10,
      pointsReward: 100,
      description:
        'Esta fascinante exploración histórica nos sumerge en los intrincados acontecimientos que marcaron la historia de Argentina y Alemania en el contexto de las tierras americanas del sur durante épocas de guerra. A través de esta crónica, nos adentraremos en un viaje que revela la compleja interconexión de dos naciones distantes, pero cuyos destinos se entrelazaron de manera inesperada en el continente americano.',
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
            image: 'https://lerni-images-2024.s3.amazonaws.com/profesor_image_profile.jpg',
          },
        },
      },
    },
    create: {
      id: programId,
      name: 'Programa para probar los componentes',
      icon: 'https://lerni-images-2024.s3.amazonaws.com/pillimage1.png',
      hoursToComplete: 10,
      pointsReward: 100,
      description:
        'Esta fascinante exploración histórica nos sumerge en los intrincados acontecimientos que marcaron la historia de Argentina y Alemania en el contexto de las tierras americanas del sur durante épocas de guerra. A través de esta crónica, nos adentraremos en un viaje que revela la compleja interconexión de dos naciones distantes, pero cuyos destinos se entrelazaron de manera inesperada en el continente americano.',
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
            image: 'https://lerni-images-2024.s3.amazonaws.com/profesor_image_profile.jpg',
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

  // NIC program

  await prisma.program.upsert({
    where: { id: programIdNIC },
    update: {
      name: 'Neumonía bacteriana adquirida 1',
      icon: 'https://lerni-images-2024.s3.amazonaws.com/lung_banner.png',
      hoursToComplete: 1,
      pointsReward: 40,
      description:
        'Descubre los aspectos clave de la neumonía bacteriana adquirida en la comunidad en adultos. Exploraremos agentes patógenos, factores de riesgo, manifestaciones clínicas, diagnóstico, tratamiento y prevención. A través de casos prácticos, obtendrás una comprensión sólida para abordar esta condición de manera informada.',
      teacher: {
        connectOrCreate: {
          where: { id: maleTeacherId },
          create: {
            id: maleTeacherId,
            name: 'Magdalena',
            lastname: 'Princz',
            email: 'maleprincz@mail.com',
            password: 'password',
            profession: 'Profesor',
            image: 'https://lerni-images-2024.s3.amazonaws.com/1659986745139+(1).jpeg',
          },
        },
      },
    },
    create: {
      id: programIdNIC,
      name: 'Neumonía bacteriana adquirida 1',
      icon: 'https://lerni-images-2024.s3.amazonaws.com/lung_banner.png',
      hoursToComplete: 1,
      pointsReward: 40,
      description:
        'Descubre los aspectos clave de la neumonía bacteriana adquirida en la comunidad en adultos. Exploraremos agentes patógenos, factores de riesgo, manifestaciones clínicas, diagnóstico, tratamiento y prevención. A través de casos prácticos, obtendrás una comprensión sólida para abordar esta condición de manera informada.',
      teacher: {
        connectOrCreate: {
          where: { id: maleTeacherId },
          create: {
            id: maleTeacherId,
            name: 'Teacher',
            lastname: 'Princz',
            email: 'maleprincz@mail.com',
            password: 'password',
            profession: 'Profesor',
            image: 'https://lerni-images-2024.s3.amazonaws.com/1659986745139+(1).jpeg',
          },
        },
      },
    },
  });

  await prisma.programVersion.upsert({
    where: { id: NICProgramVersionId },
    update: {
      programId: programIdNIC,
      version: 1,
    },
    create: {
      id: NICProgramVersionId,
      programId: programIdNIC,
      version: 1,
    },
  });

  await prisma.pill.upsert({
    where: { id: NICPillId1 },
    update: {
      name: 'Tema 1',
      description: 'Prueba',
      teacherComment: '',
    },
    create: {
      id: NICPillId1,
      name: 'Prueba',
      description: 'Prueba',
      teacherComment: '',
    },
  });

  await prisma.pillVersion.upsert({
    where: { id: NICPillVersionId1 },
    update: {
      block: NICBlock,
      version: 1,
      completionTimeMinutes: 5,
      pillId: NICPillId1,
    },
    create: {
      id: NICPillVersionId1,
      block: NICBlock,
      version: 1,
      completionTimeMinutes: 5,
      pillId: NICPillId1,
    },
  });

  await prisma.programVersionPillVersion.upsert({
    where: { id: NICprogramVersionPillVersionId1 },
    update: {
      programVersionId: NICProgramVersionId,
      pillVersionId: NICPillVersionId1,
      order: 1,
    },
    create: {
      id: NICprogramVersionPillVersionId1,
      programVersionId: NICProgramVersionId,
      pillVersionId: NICPillVersionId1,
      order: 1,
    },
  });

  await prisma.questionnaire.upsert({
    where: { id: NICQuestionnaireId },
    update: {
      name: 'Cuestionario',
      description: 'Cuestionario del programa sobre NIC',
    },
    create: {
      id: NICQuestionnaireId,
      name: 'Cuestionario',
      description: 'Cuestionario del programa sobre NIC',
    },
  });

  await prisma.questionnaireVersion.upsert({
    where: { id: NICQuestionnaireVersionId },
    update: {
      questionnaireId: NICQuestionnaireId,
      version: 1,
    },
    create: {
      id: NICQuestionnaireVersionId,
      questionnaireId: NICQuestionnaireId,
      completionTimeMinutes: 5,
      cooldownInMinutes: 10,
      block: NICQuestionnaire,
      questionCount: 8,
      passsing_score: 40,
      version: 1,
    },
  });

  await prisma.programVersionQuestionnaireVersion.upsert({
    where: { id: NICprogramVersionQuestionnaireVersionId },
    update: {
      programVersionId: NICProgramVersionId,
      questionnaireVersionId: NICQuestionnaireVersionId,
      order: 1,
    },
    create: {
      id: NICprogramVersionQuestionnaireVersionId,
      programVersionId: NICProgramVersionId,
      questionnaireVersionId: NICQuestionnaireVersionId,
      order: 1,
    },
  });

  // Fracture program

  await prisma.program.upsert({
    where: { id: FractureProgramId },
    update: {
      name: 'Fractura periprotésica femoral',
      icon: 'https://lerni-images-2024.s3.amazonaws.com/bones_wallpaper.png',
      hoursToComplete: 2,
      pointsReward: 24,
      description:
        'La cirugía de reemplazo total de cadera alivia el dolor en pacientes con artritis, pero conlleva complicaciones como fracturas periprotésicas femorales. El manejo moderno de estas fracturas es crucial debido a su creciente incidencia.',
      teacher: {
        connectOrCreate: {
          where: { id: walterTeacherId },
          create: {
            id: walterTeacherId,
            name: 'Walter',
            lastname: 'Parizzia',
            email: 'walter_parizzia@mail.com',
            password: 'password',
            profession: 'Profesor',
            image: 'https://lerni-images-2024.s3.amazonaws.com/walter_parizzia.jpeg',
          },
        },
      },
    },
    create: {
      id: FractureProgramId,
      name: 'Fractura periprotésica femoral',
      icon: 'https://lerni-images-2024.s3.amazonaws.com/bones_wallpaper.png',
      hoursToComplete: 2,
      pointsReward: 24,
      description:
        'La cirugía de reemplazo total de cadera alivia el dolor en pacientes con artritis, pero conlleva complicaciones como fracturas periprotésicas femorales. El manejo moderno de estas fracturas es crucial debido a su creciente incidencia.',
      teacher: {
        connectOrCreate: {
          where: { id: walterTeacherId },
          create: {
            id: walterTeacherId,
            name: 'Walter',
            lastname: 'Parizzia',
            email: 'walter_parizzia@mail.com',
            password: 'password',
            profession: 'Profesor',
            image: 'https://lerni-images-2024.s3.amazonaws.com/walter_parizzia.jpeg',
          },
        },
      },
    },
  });

  await prisma.programVersion.upsert({
    where: { id: FractureProgramVersionId },
    update: {
      programId: FractureProgramId,
      version: 1,
    },
    create: {
      id: FractureProgramVersionId,
      programId: FractureProgramId,
      version: 1,
    },
  });

  // Fracture program - Introduction pill

  await prisma.pill.upsert({
    where: { id: FracturePillId1 },
    update: {
      name: 'Introducción',
      description: 'Se presentará una introducción al tema de fracturas',
      teacherComment: '',
    },
    create: {
      id: FracturePillId1,
      name: 'Introducción',
      description: 'Se presentará una introducción al tema de fracturas',
      teacherComment: '',
    },
  });

  await prisma.pillVersion.upsert({
    where: { id: FracturePillVersionId1 },
    update: {
      block: FractureIntroductionBlock,
      version: 1,
      completionTimeMinutes: 10,
      pillId: FracturePillId1,
    },
    create: {
      id: FracturePillVersionId1,
      block: FractureIntroductionBlock,
      version: 1,
      completionTimeMinutes: 10,
      pillId: FracturePillId1,
    },
  });

  await prisma.programVersionPillVersion.upsert({
    where: { id: FractureProgramVersionPillVersionId1 },
    update: {
      programVersionId: FractureProgramVersionId,
      pillVersionId: FracturePillVersionId1,
      order: 1,
    },
    create: {
      id: FractureProgramVersionPillVersionId1,
      programVersionId: FractureProgramVersionId,
      pillVersionId: FracturePillVersionId1,
      order: 1,
    },
  });

  // Fracture program - Classification pill

  await prisma.pill.upsert({
    where: { id: FractureClassificationPillId1 },
    update: {
      name: 'Clasificación',
      description: 'Se presentará la clasificacion de las distintas fracturas',
      teacherComment: '',
    },
    create: {
      id: FractureClassificationPillId1,
      name: 'Clasificación',
      description: 'Se presentará la clasificacion de las distintas fracturas',
      teacherComment: '',
    },
  });

  await prisma.pillVersion.upsert({
    where: { id: FractureClassificationPillVersionId1 },
    update: {
      block: FractureClassificationBlock,
      version: 1,
      completionTimeMinutes: 15,
      pillId: FractureClassificationPillId1,
    },
    create: {
      id: FractureClassificationPillVersionId1,
      block: FractureClassificationBlock,
      version: 1,
      completionTimeMinutes: 15,
      pillId: FractureClassificationPillId1,
    },
  });

  await prisma.programVersionPillVersion.upsert({
    where: { id: FractureClassificationProgramVersionPillVersionId1 },
    update: {
      programVersionId: FractureProgramVersionId,
      pillVersionId: FractureClassificationPillVersionId1,
      order: 2,
    },
    create: {
      id: FractureClassificationProgramVersionPillVersionId1,
      programVersionId: FractureProgramVersionId,
      pillVersionId: FractureClassificationPillVersionId1,
      order: 2,
    },
  });

  // Fracture program - Classification pill

  await prisma.pill.upsert({
    where: { id: FractureB2PillId1 },
    update: {
      name: 'Fracturas B2 Periprotésicas',
      description: 'Se presentará un estudio sobre fracturas B2 periprotésicas',
      teacherComment: '',
    },
    create: {
      id: FractureB2PillId1,
      name: 'Fracturas B2 Periprotésicas',
      description: 'Se presentará un estudio sobre fracturas B2 periprotésicas',
      teacherComment: '',
    },
  });

  await prisma.pillVersion.upsert({
    where: { id: FractureB2PillVersionId1 },
    update: {
      block: FractureB2Block,
      version: 1,
      completionTimeMinutes: 8,
      pillId: FractureB2PillId1,
    },
    create: {
      id: FractureB2PillVersionId1,
      block: FractureB2Block,
      version: 1,
      completionTimeMinutes: 8,
      pillId: FractureB2PillId1,
    },
  });

  await prisma.programVersionPillVersion.upsert({
    where: { id: FractureB2ProgramVersionPillVersionId1 },
    update: {
      programVersionId: FractureProgramVersionId,
      pillVersionId: FractureB2PillVersionId1,
      order: 3,
    },
    create: {
      id: FractureB2ProgramVersionPillVersionId1,
      programVersionId: FractureProgramVersionId,
      pillVersionId: FractureB2PillVersionId1,
      order: 3,
    },
  });

  // Fracture program - Questionnaire

  await prisma.questionnaire.upsert({
    where: { id: FractureQuestionnaireId },
    update: {
      name: 'Cuestionario',
      description: 'Cuestionario del programa sobre Fractura periprotésica femoral',
    },
    create: {
      id: FractureQuestionnaireId,
      name: 'Cuestionario',
      description: 'Cuestionario del programa sobre Fractura periprotésica femoral',
    },
  });

  await prisma.questionnaireVersion.upsert({
    where: { id: FractureQuestionnaireVersionId },
    update: {
      questionnaireId: FractureQuestionnaireId,
      version: 1,
    },
    create: {
      id: FractureQuestionnaireVersionId,
      questionnaireId: FractureQuestionnaireId,
      completionTimeMinutes: 5,
      cooldownInMinutes: 10,
      block: NICQuestionnaire,
      questionCount: 8,
      passsing_score: 40,
      version: 1,
    },
  });

  await prisma.programVersionQuestionnaireVersion.upsert({
    where: { id: FractureProgramVersionQuestionnaireVersionId },
    update: {
      programVersionId: FractureProgramVersionId,
      questionnaireVersionId: FractureQuestionnaireVersionId,
      order: 4,
    },
    create: {
      id: FractureProgramVersionQuestionnaireVersionId,
      programVersionId: FractureProgramVersionId,
      questionnaireVersionId: FractureQuestionnaireVersionId,
      order: 4,
    },
  });

  // User
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
  await prisma.studentProgram.upsert({
    where: { id: NICstudentProgramId },
    update: {
      studentId: studentId,
      programVersionId: NICProgramVersionId,
    },
    create: {
      id: NICstudentProgramId,
      studentId: studentId,
      programVersionId: NICProgramVersionId,
    },
  });
  await prisma.studentProgram.upsert({
    where: { id: FractureStudentProgramId },
    update: {
      studentId: studentId,
      programVersionId: FractureProgramVersionId,
    },
    create: {
      id: FractureStudentProgramId,
      studentId: studentId,
      programVersionId: FractureProgramVersionId,
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

  await prisma.trivia.upsert({
    where: {
      id: triviaId,
    },
    update: {
      block: triviaBlock,
      questionCount: 12,
    },
    create: {
      id: triviaId,
      block: triviaBlock,
      questionCount: 12,
    },
  });

  await prisma.programVersionTrivia.upsert({
    where: { id: programVersionTrivia },
    update: {
      order: 1,
      triviaId: triviaId,
      programVersionId: programVersionId,
    },
    create: {
      id: programVersionTrivia,
      order: 1,
      triviaId: triviaId,
      programVersionId: programVersionId,
    },
  });

  await prisma.triviaMatch.upsert({
    where: { id: triviaMatchId },
    update: {
      triviaId: triviaId,
    },
    create: {
      id: triviaMatchId,
      triviaId: triviaId,
    },
  });

  await prisma.studentTriviaMatch.upsert({
    where: { id: studentTriviaMatchId },
    update: {
      studentId: studentId,
      triviaMatchId: triviaMatchId,
    },
    create: {
      id: studentTriviaMatchId,
      studentId: studentId,
      triviaMatchId: triviaMatchId,
    },
  });

  await extraPrograms(10);
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

async function extraPrograms(n: number = 10) {
  for (let i = 0; i < n; i++) {
    const programId1 = 'programId ' + i;
    const teacherId1 = 'teacherId ' + i;
    const programVersionId1 = 'programVersionId ' + i;
    const pillId1 = 'pillId ' + i;
    const pillVersionId1 = 'pillVersionId ' + i;
    const programVersionPillVersionId1 = 'programVersionPillVersionId ' + i;
    const studentId1 = 'studentId ' + i;
    const authId1 = 'authId ' + i;
    const studentProgramId1 = 'studentProgramId ' + i;
    const questionnaireId1 = 'questionnaireId ' + i;
    const questionnaireVersionId1 = 'questionnaireVersionId ' + i;
    const programVersionQuestionnaireVersionId1 = 'programVersionQuestionnaireVersionId ' + i;
    const triviaId1 = 'triviaId ' + i;
    const programVersionTrivia1 = 'programVersionTrivia ' + i;
    const triviaMatchId1 = 'triviaMatchId ' + i;
    const studentTriviaMatchId1 = 'studentTriviaMatchId ' + i;

    await prisma.program.upsert({
      where: { id: programId1 },
      update: {
        name: 'Programa para probar los componentes',
        icon: 'https://lerni-images-2024.s3.amazonaws.com/pillimage1.png',
        hoursToComplete: 10,
        pointsReward: 100,
        description:
          'Esta fascinante exploración histórica nos sumerge en los intrincados acontecimientos que marcaron la historia de Argentina y Alemania en el contexto de las tierras americanas del sur durante épocas de guerra. A través de esta crónica, nos adentraremos en un viaje que revela la compleja interconexión de dos naciones distantes, pero cuyos destinos se entrelazaron de manera inesperada en el continente americano.',
        teacher: {
          connectOrCreate: {
            where: { id: teacherId1 },
            create: {
              id: teacherId1,
              name: 'Teacher',
              lastname: 'Teacher',
              email: 'teacher@mail.com',
              password: 'password',
              profession: 'Profesor',
              image: 'https://lerni-images-2024.s3.amazonaws.com/profesor_image_profile.jpg',
            },
          },
        },
      },
      create: {
        id: programId1,
        name: 'Programa para probar los componentes',
        icon: 'https://lerni-images-2024.s3.amazonaws.com/pillimage1.png',
        hoursToComplete: 10,
        pointsReward: 100,
        description:
          'Esta fascinante exploración histórica nos sumerge en los intrincados acontecimientos que marcaron la historia de Argentina y Alemania en el contexto de las tierras americanas del sur durante épocas de guerra. A través de esta crónica, nos adentraremos en un viaje que revela la compleja interconexión de dos naciones distantes, pero cuyos destinos se entrelazaron de manera inesperada en el continente americano.',
        teacher: {
          connectOrCreate: {
            where: { id: teacherId1 },
            create: {
              id: teacherId1,
              name: 'Teacher',
              lastname: 'Teacher',
              email: 'teacher@mail.com',
              password: 'password',
              profession: 'Profesor',
              image: 'https://lerni-images-2024.s3.amazonaws.com/profesor_image_profile.jpg',
            },
          },
        },
      },
    });

    await prisma.programVersion.upsert({
      where: { id: programVersionId1 },
      update: {
        programId: programId1,
        version: 1,
      },
      create: {
        id: programVersionId1,
        programId: programId1,
        version: 1,
      },
    });

    await prisma.pill.upsert({
      where: { id: pillId1 },
      update: {
        name: 'Prueba',
        description: 'Prueba',
        teacherComment: 'Esta es la píldora de prueba, es un buen lugar para comenzar.',
      },
      create: {
        id: pillId1,
        name: 'Prueba',
        description: 'Prueba',
        teacherComment: 'Esta es la píldora de prueba, es un buen lugar para comenzar.',
      },
    });

    await prisma.pillVersion.upsert({
      where: { id: pillVersionId1 },
      update: {
        block: pillBlock,
        version: 1,
        completionTimeMinutes: 5,
        pillId: pillId1,
      },
      create: {
        id: pillVersionId1,
        block: pillBlock,
        version: 1,
        completionTimeMinutes: 5,
        pillId: pillId1,
      },
    });

    await prisma.programVersionPillVersion.upsert({
      where: { id: programVersionPillVersionId1 },
      update: {
        programVersionId: programVersionId1,
        pillVersionId: pillVersionId1,
        order: 1,
      },
      create: {
        id: programVersionPillVersionId1,
        programVersionId: programVersionId1,
        pillVersionId: pillVersionId1,
        order: 1,
      },
    });

    await prisma.auth.upsert({
      where: { id: authId1 },
      update: {
        email: `monosteve123${i}@gmail.com`,
        password: '$2b$10$8mYwGBbOvUJEx63DYIZc0.NQdFyW9x0jcctuKk/D7G0gmCuwaAnrO',
      },
      create: {
        id: authId,
        email: `monosteve123${i}@gmail.com`,
        password: '$2b$10$8mYwGBbOvUJEx63DYIZc0.NQdFyW9x0jcctuKk/D7G0gmCuwaAnrO',
      },
    });

    await prisma.student.upsert({
      where: { id: studentId1 },
      update: {
        name: 'John',
        lastname: 'Doe',
        career: 'Computer Science',
        city: 'New York',
        auth: {
          connect: {
            id: authId1,
          },
        },
      },
      create: {
        id: studentId1,
        name: 'John',
        lastname: 'Doe',
        career: 'Computer Science',
        city: 'New York',
        auth: {
          connect: {
            id: authId1,
          },
        },
      },
    });
    await prisma.studentProgram.upsert({
      where: { id: studentProgramId1 },
      update: {
        studentId: studentId1,
        programVersionId: programVersionId1,
      },
      create: {
        id: studentProgramId1,
        studentId: studentId1,
        programVersionId: programVersionId1,
      },
    });

    await prisma.studentProgram.upsert({
      where: { id: studentProgramId1 + i },
      update: {
        studentId: studentId,
        programVersionId: programVersionId1,
      },
      create: {
        id: studentProgramId1 + i,
        studentId: studentId,
        programVersionId: programVersionId1,
      },
    });

    await prisma.questionnaire.upsert({
      where: { id: questionnaireId1 },
      update: {
        name: 'Cuestionario de prueba',
        description: 'Cuestionario de prueba',
      },
      create: {
        id: questionnaireId1,
        name: 'Cuestionario de prueba',
        description: 'Cuestionario de prueba',
      },
    });

    await prisma.questionnaireVersion.upsert({
      where: { id: questionnaireVersionId1 },
      update: {
        questionnaireId: questionnaireId1,
        version: 1,
      },
      create: {
        id: questionnaireVersionId1,
        questionnaireId: questionnaireId1,
        completionTimeMinutes: 5,
        cooldownInMinutes: 10,
        block: questionnaireBlock,
        questionCount: 3,
        passsing_score: 50,
        version: 1,
      },
    });

    await prisma.programVersionQuestionnaireVersion.upsert({
      where: { id: programVersionQuestionnaireVersionId1 },
      update: {
        programVersionId: programVersionId1,
        questionnaireVersionId: questionnaireVersionId1,
        order: 1,
      },
      create: {
        id: programVersionQuestionnaireVersionId1,
        programVersionId: programVersionId1,
        questionnaireVersionId: questionnaireVersionId1,
        order: 1,
      },
    });

    await prisma.trivia.upsert({
      where: {
        id: triviaId1,
      },
      update: {
        block: triviaBlock,
        questionCount: 12,
      },
      create: {
        id: triviaId1,
        block: triviaBlock,
        questionCount: 12,
      },
    });

    await prisma.programVersionTrivia.upsert({
      where: { id: programVersionTrivia1 },
      update: {
        order: 1,
        triviaId: triviaId1,
        programVersionId: programVersionId1,
      },
      create: {
        id: programVersionTrivia1,
        order: 1,
        triviaId: triviaId1,
        programVersionId: programVersionId1,
      },
    });

    await prisma.triviaMatch.upsert({
      where: { id: triviaMatchId1 },
      update: {
        triviaId: triviaId1,
      },
      create: {
        id: triviaMatchId1,
        triviaId: triviaId1,
      },
    });

    await prisma.studentTriviaMatch.upsert({
      where: { id: studentTriviaMatchId1 },
      update: {
        studentId: studentId1,
        triviaMatchId: triviaMatchId1,
      },
      create: {
        id: studentTriviaMatchId1,
        studentId: studentId1,
        triviaMatchId: triviaMatchId1,
      },
    });

    await prisma.studentTriviaMatch.upsert({
      where: { id: studentTriviaMatchId1 + i },
      update: {
        studentId: studentId,
        triviaMatchId: triviaMatchId1,
      },
      create: {
        id: studentTriviaMatchId1 + i,
        studentId: studentId,
        triviaMatchId: triviaMatchId1,
      },
    });
  }
}
