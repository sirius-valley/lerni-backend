import { SimplePillDto } from './simple-pill.dto';
import { TeacherDto } from '../../pill/dtos/teacher.dto';
import { Program, ProgramObjective, Teacher } from '@prisma/client';

export class ProgramDetailsDto {
  id: string;
  programName: string;
  teacher: TeacherDto;
  progress: number;
  pillCount: number;
  icon: string;
  estimatedHours: number;
  points: number;
  programDescription: string;
  programObjectives: string[];
  pills: SimplePillDto[];

  constructor(
    objectives: ProgramObjective[],
    program: Program & { teacher: Teacher },
    pillVersions: {
      pv: any;
      order: number;
    }[],
  ) {
    this.id = program.id;
    this.programName = program.name;
    this.teacher = new TeacherDto(program.teacher);
    this.progress = pillVersions.reduce((acc, pvPillV) => acc + (pvPillV.pv.pillSubmissions[0]?.progress || 0), 0) / pillVersions.length;
    this.pillCount = pillVersions.length;
    this.icon = program.icon;
    this.estimatedHours = program.hoursToComplete;
    this.points = program.pointsReward;
    this.programDescription = program.description ?? '';
    this.programObjectives = objectives.map((o) => o.name);
    this.pills = pillVersions.map((pvPillV) => {
      return new SimplePillDto(pvPillV.pv.pill, pvPillV.pv.pillSubmissions[0]?.progress || 0);
    });
  }
}
