import { Pill } from '@prisma/client';
import { SearchType } from './search-result.dto';

export class SearchPillDto {
  id: string;
  name: string;
  searchType: SearchType = SearchType.PILL;
  description: string;

  constructor(pill: Pill) {
    this.id = pill.id;
    this.name = pill.name;
    this.description = pill.description;
  }
}
