import { Injectable } from '@nestjs/common';
import { SearchProgramDto } from './dto/searchProgram.dto';
import { SearchRepository } from './search.repository';

@Injectable()
export class SearchService {
  constructor(private readonly searchRepository: SearchRepository) {}

  async search(query: string, filter: string, page: number): Promise<any> {
    const options = { limit: Number(10), before: String(Number((page - 1) * 10)), after: undefined };
    switch (filter) {
      case 'program': {
        const { results, total } = await this.searchRepository.searchByPrograms(query, options);
        const map = results.map((result) => new SearchProgramDto(result)).reverse();
        return { results: map, maxPage: Math.ceil(total / 10) };
      }
      case 'professor': {
        const { results, total } = await this.searchRepository.searchByProfessor(query, options);
        const map = results.map((result) => new SearchProgramDto(result)).reverse();
        return { results: map, maxPage: Math.ceil(total / 10) };
      }
      case 'pill': {
        const { results, total } = await this.searchRepository.searchByPills(query, options);
        const map = results.map((result) => new SearchProgramDto(result)).reverse();
        return { results: map, maxPage: Math.ceil(total / 10) };
      }
      default: {
        const { results, total } = await this.searchRepository.searchByAll(query, options);
        const map = results.map((result) => new SearchProgramDto(result)).reverse();
        return { results: map, maxPage: Math.ceil(total / 10) };
      }
    }
  }
}
