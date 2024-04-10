export class ProgramVotesDto {
  likes?: number;
  dislikes?: number;

  constructor(likes?: number, dislikes?: number) {
    this.likes = likes;
    this.dislikes = dislikes;
  }
}
