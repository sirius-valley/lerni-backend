export interface ApiRequest extends Request {
  user: {
    id: string;
    name?: string;
    lastname?: string;
    profession?: string;
    image?: string;
    authId: string;
  };
}
