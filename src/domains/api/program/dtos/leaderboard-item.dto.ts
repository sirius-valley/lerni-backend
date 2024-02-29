export class LeaderboardItemDto {
  id: string;
  studentId: string;
  profileImage: string;
  rank: number;
  fullName: string;
  points: number;

  constructor(data: LeaderboardItemDto) {
    this.id = data.id;
    this.studentId = data.studentId;
    this.profileImage = data.profileImage;
    this.rank = data.rank;
    this.fullName = data.fullName;
    this.points = data.points;
  }
}
