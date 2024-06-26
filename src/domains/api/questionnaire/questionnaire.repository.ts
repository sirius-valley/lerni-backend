import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class QuestionnaireRepository {
  constructor(private prisma: PrismaService) {}

  public async getQuestionnaireSubmissionByQuestionnaireIdAndStudentId(questionnaireId: string, studentId: string) {
    return this.prisma.questionnaireSubmission.findFirst({
      where: {
        studentId,
        questionnaireVersion: {
          questionnaireId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        questionnaireAnswers: true,
        questionnaireVersion: true,
      },
    });
  }

  public async createQuestionnaireSubmission(questionnaireVersionId: string, studentId: string) {
    return this.prisma.questionnaireSubmission.create({
      data: {
        studentId,
        questionnaireVersionId,
      },
      include: {
        questionnaireAnswers: true,
        questionnaireVersion: {
          include: {
            questionnaire: true,
          },
        },
      },
    });
  }

  public async getStudentProgramByStudentIdAndQuestionnaireId(studentId: string, questionnaireId: string) {
    return this.prisma.studentProgram.findFirst({
      where: {
        studentId,
        programVersion: {
          programVersionQuestionnaireVersions: {
            some: {
              questionnaireVersion: {
                questionnaireId,
              },
            },
          },
        },
      },
    });
  }

  public async getQuestionnaireVersionByQuestionnaireIdAndStudentId(questionnaireId: string, studentId: string) {
    return this.prisma.questionnaireVersion.findFirst({
      where: {
        questionnaireId,
      },
      include: {
        questionnaire: true,
        questionnaireSubmissions: {
          where: {
            studentId,
          },
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            questionnaireAnswers: true,
          },
        },
      },
    });
  }

  public async saveCompletedQuestionnaireSubmissionBySubmissionId(
    questionnaireSubmissionId: string,
    points: number,
    questionnaireId: string,
  ) {
    return this.prisma.questionnaireSubmission.update({
      data: {
        finishedDateTime: new Date(),
        student: {
          update: {
            pointCount: {
              increment: points,
            },
            points: {
              create: {
                amount: points,
                sourceEntity: 'questionnaire',
                entityId: questionnaireId,
              },
            },
          },
        },
      },
      where: {
        id: questionnaireSubmissionId,
      },
    });
  }

  public async createQuestionnaireAnswer(
    questionnaireSubmissionId: string,
    questionId: string,
    value: string | string[],
    isCorrect: boolean,
  ) {
    value = JSON.stringify(value);
    return this.prisma.questionnaireSubmission.update({
      data: {
        questionnaireAnswers: {
          create: {
            questionId,
            value,
            isCorrect,
          },
        },
      },
      where: {
        id: questionnaireSubmissionId,
      },
      include: {
        questionnaireAnswers: true,
        questionnaireVersion: true,
      },
    });
  }

  public async setQuestionnaireSubmissionCompletedDateTime(questionnaireSubmissionId: string, date: Date) {
    return this.prisma.questionnaireSubmission.update({
      data: {
        finishedDateTime: date,
      },
      where: {
        id: questionnaireSubmissionId,
      },
    });
  }

  public async getProgramTeacherByQuestionnaireId(questionnaireId: string) {
    return this.prisma.teacher.findFirst({
      where: {
        programs: {
          some: {
            versions: {
              some: {
                programVersionQuestionnaireVersions: {
                  some: {
                    questionnaireVersion: {
                      questionnaireId,
                    },
                  },
                },
              },
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        lastname: true,
        profession: true,
        image: true,
      },
    });
  }

  public async getQuestionnaireTeacherByQuestionnaireId(questionnaireId: string) {
    return this.prisma.teacher.findFirst({
      where: {
        questionnaires: {
          some: {
            id: questionnaireId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        lastname: true,
        profession: true,
        image: true,
      },
    });
  }

  public async updateQuestionnaireSubmissionProgress(questionnaireSubmissionId: string, progress: number) {
    return this.prisma.questionnaireSubmission.update({
      data: {
        progress,
      },
      where: {
        id: questionnaireSubmissionId,
      },
    });
  }

  public async createQuestionnaire(name: string, description: string, teacherId?: string) {
    return this.prisma.questionnaire.create({
      data: {
        name,
        description,
        teacherId,
      },
    });
  }

  public async createQuestionnaireVersion(
    questionnaireId: string,
    completionTimeMinutes: number,
    cooldownInMinutes: number,
    block: string,
    questionCount: number,
    passsing_score: number,
    version: number,
  ) {
    return this.prisma.questionnaireVersion.create({
      data: {
        questionnaireId,
        completionTimeMinutes,
        cooldownInMinutes,
        block,
        questionCount,
        passsing_score,
        version,
      },
    });
  }

  public async getProgramVersionByquestionnaireId(questionnaireId: string) {
    return await this.prisma.programVersion.findFirst({
      where: {
        programVersionQuestionnaireVersions: {
          some: {
            questionnaireVersion: {
              questionnaireId,
            },
          },
        },
      },
    });
  }

  public async delete(id: string) {
    await this.prisma.questionnaireVersion.deleteMany({
      where: {
        questionnaireId: id,
      },
    });

    return await this.prisma.questionnaire.delete({
      where: {
        id,
      },
    });
  }
}
