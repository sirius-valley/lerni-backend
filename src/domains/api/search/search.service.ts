import { Injectable } from '@nestjs/common';
import { ProgramStatus, SearchProgramDto } from './dto/searchProgram.dto';
import { SearchRepository } from './search.repository';
import { StudentDto } from '../student/dtos/student.dto';
import { SearchResultDto } from './dto/search-result.dto';
import { SimpleProfessortDto } from '../professor/dto/simple-professor.dto';

@Injectable()
export class SearchService {
  constructor(private readonly searchRepository: SearchRepository) {}

  async search(student: StudentDto, query: string, page: number): Promise<any> {
    const options = { limit: Number(10), offset: page > 0 ? (page - 1) * 10 : 0 };
    const { results, total } = await this.searchRepository.searchByPrograms(query, student.id, options);
    const map = results.map((result) => this.getSearchProgramDto(result)).reverse();
    return new SearchResultDto(map, Math.ceil(total / 10), page ? page : 1);
  }

  private getSearchProgramDto(studentProgram: any) {
    if (studentProgram.programVersion.startDate > new Date())
      return new SearchProgramDto(
        studentProgram.programVersion.program,
        new SimpleProfessortDto(studentProgram.programVersion.program.teacher),
        0,
        ProgramStatus.LOCKED,
        studentProgram.programVersion.startDate,
      );

    const progress = this.calculateProgress(
      studentProgram.programVersion.programVersionPillVersions,
      studentProgram.programVersion.programVersionQuestionnaireVersions[0],
    );

    const status = this.getProgramStatus(progress);

    return new SearchProgramDto(
      studentProgram.programVersion.program,
      new SimpleProfessortDto(studentProgram.programVersion.program.teacher),
      progress,
      status,
    );
  }

  private calculateProgress(pillVersions: any, questionnaireVersion: any) {
    const totalPillProgress = pillVersions.reduce(
      (acc: number, pvPillV: any) => acc + (pvPillV.pillVersion.pillSubmissions[0]?.progress || 0),
      0,
    );
    return (
      (totalPillProgress + (questionnaireVersion.questionnaireVersion.questionnaireSubmissions[0]?.progress || 0)) /
      (pillVersions.length + 1)
    );
  }

  private getProgramStatus(progress: number): ProgramStatus {
    if (progress === 0) return ProgramStatus.NOT_STARTED;
    if (progress >= 100) return ProgramStatus.COMPLETED;
    return ProgramStatus.IN_PROGRESS;
  }
}
