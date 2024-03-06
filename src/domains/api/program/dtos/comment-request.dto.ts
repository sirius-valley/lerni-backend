import { Privacy, Vote } from '@prisma/client';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CommentRequestDto {
  @IsNotEmpty()
  programId: string;
  @IsOptional()
  content: string;
  @IsNotEmpty()
  vote: Vote;
  @IsNotEmpty()
  privacy: Privacy;
}
