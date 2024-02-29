import { Injectable } from '@nestjs/common';
import { SearchProgramDto } from './dto/searchProgram.dto';
import { SearchRepository } from './search.repository';
import { StudentDto } from '../student/dtos/student.dto';
import { SearchPillDto } from './dto/search-pill.dto';
import { SearchResultDto } from './dto/search-result.dto';

@Injectable()
export class SearchService {
  constructor(private readonly searchRepository: SearchRepository) {}

  async search(student: StudentDto, query: string, filter: string, page: number): Promise<any> {
    const options = { limit: Number(10), before: page ? String((page - 1) * 10) : '0', after: undefined };
    switch (filter) {
      case 'program': {
        const { results, total } = await this.searchRepository.searchByPrograms(query, student.id, options);
        const map = results.map((result) => new SearchProgramDto(result)).reverse();
        return new SearchResultDto(map, Math.ceil(total / 10), page ? page : 1);
      }
      case 'professor': {
        const { results, total } = await this.searchRepository.searchByProfessor(query, options);
        const map = results.map((result) => new SearchProgramDto(result)).reverse();
        return new SearchResultDto(map, Math.ceil(total / 10), page ? page : 1);
      }
      case 'pill': {
        const { results, total } = await this.searchRepository.searchByPills(query, student.id, options);
        const map = results.map((result) => new SearchPillDto(result)).reverse();
        return new SearchResultDto(map, Math.ceil(total / 10), page ? page : 1);
      }
      default: {
        const { programResults, pillResults, total } = await this.searchRepository.searchByAll(query, student.id, options);
        const map = [
          ...programResults.map((result) => new SearchProgramDto(result)),
          ...pillResults.map((result) => new SearchPillDto(result)),
        ];
        return new SearchResultDto(map, Math.ceil(total / 10), page ? page : 1);
      }
    }
  }
}
