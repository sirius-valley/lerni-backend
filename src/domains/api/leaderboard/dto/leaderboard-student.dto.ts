export class LeaderboardStudentDto {
  id: string;
  profileImage: string;
  rank: number;
  fullName: string;
  email: string;
  points: number;

  constructor(data: LeaderboardStudentDto) {
    this.id = data.id;
    this.profileImage = data.profileImage;
    this.rank = data.rank;
    this.fullName = data.fullName;
    this.points = data.points;
    this.email = data.email;
  }
}
