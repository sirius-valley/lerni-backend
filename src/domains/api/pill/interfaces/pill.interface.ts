export interface PillForm {
  id: string;
  name?: string;
  type: FormType;
  initial: string;
  elements: PillNode[];
  relations: PillRelations[];
}

export interface PillNode {
  id: string;
  type: ElementType;
  name: string;
  question_type?: QuestionType;
  metadata?: any;
}

export interface PillRelations {
  from: string;
  to: string;
  condition?: string;
  priority?: number;
}

export enum FormType {
  DYNAMIC = 'DYNAMIC',
  STATIC = 'STATIC',
}

export enum ElementType {
  ACTION = 'ACTION',
  QUESTION = 'QUESTION',
}

export enum QuestionType {
  SINGLECHOICE = 'SINGLECHOICE',
  MULTIPLECHOICE = 'MULTIPLECHOICE',
  TEXTINPUT = 'TEXTINPUT',
  NUMBERINPUT = 'NUMBERINPUT',
  BOOLEANINPUT = 'BOOLEANINPUT',
}
