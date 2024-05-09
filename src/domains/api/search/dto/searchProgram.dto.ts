import { Program } from '@prisma/client';
import { SearchType } from './search-result.dto';
import { SimpleProfessortDto } from '../../professor/dto/simple-professor.dto';

export class SearchProgramDto {
  id: string;
  name: string;
  icon: string;
  searchType: SearchType = SearchType.PROGRAM;
  description: string | null;
  teacher: SimpleProfessortDto;

  constructor(program: Program, teacher: SimpleProfessortDto) {
    this.id = program.id;
    this.name = program.name;
    this.icon = program.icon;
    this.description = program.description;
    this.teacher = teacher;
  }
}
