import { Injectable } from '@nestjs/common';
import { ProfessorRequestDto } from './dto/professor-request.dto';
import { ProfessorRepository } from './professor.repository';

@Injectable()
export class ProfessorService {
  constructor(private readonly professorRepository: ProfessorRepository) {}

  async create(newProfessor: ProfessorRequestDto): Promise<any> {
    return await this.professorRepository.createSimpleProfessor(newProfessor);
  }
}
