import { SearchPillDto } from './search-pill.dto';
import { SearchProgramDto } from './searchProgram.dto';

export enum SearchType {
  PROGRAM = 'program',
  PILL = 'pill',
}
export class SearchResultDto {
  results: (SearchPillDto | SearchProgramDto)[];
  maxPage: number;
  currentPage: number;
  constructor(results: any[], maxPage: number, currentPage: number) {
    this.results = results;
    this.maxPage = maxPage;
    this.currentPage = currentPage;
  }
}
