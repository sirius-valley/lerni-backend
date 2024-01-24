import { PrismaClient } from '@prisma/client';
import { introductionID } from '../../src/const';
import { introductionBlock } from './const';

const prisma = new PrismaClient();

async function main() {
  await prisma.pillVersion.upsert({
    where: { id: '7cf767b2-9ac5-4420-8680-a9e000438d94' },
    update: {},
    create: {
      block: introductionBlock,
      version: 1,
      completionTimeMinutes: 5,
      pill: {
        create: {
          id: introductionID,
          name: 'Introduction',
          description: 'Introduction',
          teacherComment: 'This is the introduction pill. It\'s a good place to start!',
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