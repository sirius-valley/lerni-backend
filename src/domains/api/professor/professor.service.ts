import { Injectable } from '@nestjs/common';
import { ProfessorRequestDto } from './dto/professor-request.dto';
import { SimpleProfessortDto } from './dto/simple-professor.dto';
import { ProfessorRepository } from './professor.repository';

@Injectable()
export class ProfessorService {
  constructor(private readonly professorRepository: ProfessorRepository) {}

  async create(newProfessor: ProfessorRequestDto): Promise<any> {
    return await this.professorRepository.createSimpleProfessor(newProfessor);
  }

  async getProfessors(page: number): Promise<SimpleProfessortDto[]> {
    const options = { limit: Number(10), offset: (page - 1) * 10 };
    return await this.professorRepository.getProfessors(options);
  }
}
