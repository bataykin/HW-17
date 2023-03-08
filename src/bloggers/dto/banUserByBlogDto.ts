import { IsBoolean, IsString, IsUUID, MinLength } from "class-validator";

export class BanUserByBlogDto {
  @IsBoolean()
  isBanned: boolean;

  @IsString()
  @MinLength(20)
  banReason: string;

  @IsUUID()
  blogId: string;
}
