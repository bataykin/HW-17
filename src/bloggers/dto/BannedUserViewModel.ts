import { IsUUID } from "class-validator";

export class BannedUserViewModel {
  @IsUUID()
  id: string;

  login: string;

  banInfo: {
    isBanned: boolean;
    banDate: Date | null;
    banReason: string | null;
  };
}
