import { Privacy, Vote } from '@prisma/client';
import { IsNotEmpty } from 'class-validator';

export class CommentRequestDto {
  @IsNotEmpty()
  programId: string;
  content: string;
  @IsNotEmpty()
  vote: Vote;
  @IsNotEmpty()
  privacy: Privacy;
}
