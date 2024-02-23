import { PillForm } from '../interfaces/pill.interface';

export class PillBlockDto {
  pillBlock: PillForm;

  constructor(pillBlock: PillForm) {
    this.pillBlock = pillBlock;
  }
}
