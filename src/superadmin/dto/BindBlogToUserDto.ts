import { IsUUID } from "class-validator";

export class BindBlogToUserDto {
  @IsUUID()
  id: string;

  @IsUUID()
  userId: string;
}
