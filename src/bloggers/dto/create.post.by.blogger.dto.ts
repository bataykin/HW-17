import { IsString, Max } from "class-validator";

export class CreatePostByBloggerDto {
  @IsString()
  @Max(30)
  title: string;

  @IsString()
  @Max(100)
  shortDescription: string;

  @IsString()
  @Max(1000)
  content: string;
}
