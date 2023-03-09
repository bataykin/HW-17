import { IsDate, IsEmail, IsUUID } from "class-validator";

export class SAUserViewModel {
  @IsUUID()
  id: string;

  login: string;

  @IsEmail()
  email: string;

  @IsDate()
  createdAt: Date;

  banInfo: {
    isBanned: boolean;
    banDate: Date | null;
    banReason: string | null;
  };
}
