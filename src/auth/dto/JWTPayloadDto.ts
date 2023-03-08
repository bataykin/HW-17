export class JWTPayloadDto {
  username: string;
  sub: string;
  deviceId: string;
  title: string;
  ip: string;
  userId: string;
  issuedAt: Date;
  sessionId: string;
}
