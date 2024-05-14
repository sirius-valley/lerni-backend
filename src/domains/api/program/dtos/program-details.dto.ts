import { SimplePillDto } from './simple-pill.dto';
import { TeacherDto } from '../../pill/dtos/teacher.dto';
import { SimpleQuestionnaireDto } from './simple-questionnaire.dto';
import { ProgramLeaderboardDto } from './program-leaderboard.dto';

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
  pills: SimplePillDto[];
  questionnaire: SimpleQuestionnaireDto[];
  leaderBoard: ProgramLeaderboardDto;
  startDate?: Date;
  endDate?: Date;

  constructor(programDetailsDto: ProgramDetailsDto) {
    this.id = programDetailsDto.id;
    this.programName = programDetailsDto.programName;
    this.teacher = programDetailsDto.teacher;
    this.progress = programDetailsDto.progress;
    this.pillCount = programDetailsDto.pillCount;
    this.icon = programDetailsDto.icon;
    this.estimatedHours = programDetailsDto.estimatedHours;
    this.points = programDetailsDto.points;
    this.programDescription = programDetailsDto.programDescription;
    this.pills = programDetailsDto.pills;
    this.questionnaire = programDetailsDto.questionnaire;
    this.leaderBoard = programDetailsDto.leaderBoard;
    this.startDate = programDetailsDto.startDate;
    this.endDate = programDetailsDto.endDate;
  }
}
