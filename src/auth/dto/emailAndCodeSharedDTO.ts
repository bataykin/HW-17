import { IsEmail, IsUUID } from "class-validator";

export class EmailAndCodeSharedDTO {
  @IsEmail()
  email?: string;

  @IsUUID()
  code?: string;
}
