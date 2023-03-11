import { IsDate, IsUUID } from "class-validator";

export class BlogViewModel {
  @IsUUID()
  id: string;

  name: string;

  description: string;

  websiteUrl: string;

  @IsDate()
  createdAt: Date;

  isMembership: boolean;
}
