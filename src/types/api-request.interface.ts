export interface ApiRequest extends Request {
  user: {
    authId: string;
    studentId?: string;
  };
}
