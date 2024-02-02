import { PrismaClient } from '@prisma/client';
import { introductionID } from '../../src/const';
import { introductionBlock } from './const';

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
        }
      }
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