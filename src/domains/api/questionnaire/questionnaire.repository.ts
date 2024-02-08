import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class QuestionnaireRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getQuestionnaire(studentId: string, questionnaireId: string) {
    return this.prisma.questionnaireVersion.findFirst({
      where: {
        questionnaireId,
        programVersions: {
          some: {
            programVersion: {
              studentPrograms: {
                some: {
                  studentId,
                },
              },
            },
          },
        },
      },
      include: {
        questionnaire: true,
        questionnaireSubmissions: {
          where: {
            studentId,
          },
          orderBy: {},
        },
      },
    });
  }
}
