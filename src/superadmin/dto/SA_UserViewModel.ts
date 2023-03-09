import { IsDate, IsEmail, IsUUID } from "class-validator";

export class SA_UserViewModel {
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
