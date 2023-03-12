import { IsDate, IsUrl, IsUUID } from "class-validator";

export class SA_BlogViewModel {
  @IsUUID()
  id: string;
  name: string;
  description: string;
  @IsUrl()
  websiteUrl: string;
  @IsDate()
  createdAt: Date;
  isMembership: boolean;

  blogOwnerInfo: {
    userId: string;
    userLogin: string;
  };

  banInfo: {
    isBanned: boolean;
    banDate: Date;
  };
}
