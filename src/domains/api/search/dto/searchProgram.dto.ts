import { Program } from '@prisma/client';
import { SearchType } from './search-result.dto';

export class SearchProgramDto {
  id: string;
  name: string;
  icon: string;
  searchType: SearchType = SearchType.PROGRAM;
  description: string | null;

  constructor(program: Program) {
    this.id = program.id;
    this.name = program.name;
    this.icon = program.icon;
    this.description = program.description;
  }
}
