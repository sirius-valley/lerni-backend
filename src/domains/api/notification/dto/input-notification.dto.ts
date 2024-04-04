export class InputNotificationDto {
  default: string;
  body: string;
  title: string;
  sound: string;
  GCM?: any;

  constructor(data: InputNotificationDto) {
    this.default = data.default;
    this.GCM = JSON.stringify({
      notification: {
        body: data.body,
        title: data.title,
        sound: data.sound,
      },
    });
  }
}
