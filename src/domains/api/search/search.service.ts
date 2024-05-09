import { Injectable } from '@nestjs/common';
import { SearchProgramDto } from './dto/searchProgram.dto';
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
    const map = results.map((result) => new SearchProgramDto(result, new SimpleProfessortDto(result.teacher))).reverse();
    return new SearchResultDto(map, Math.ceil(total / 10), page ? page : 1);
  }
}
