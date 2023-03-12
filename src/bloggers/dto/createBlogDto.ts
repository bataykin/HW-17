import { IsUrl, MaxLength } from "class-validator";
import { Transform, TransformFnParams } from "class-transformer";

export class CreateBlogDto {
  // @IsString()
  @MaxLength(15)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  name: string;

  @MaxLength(500)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  description: string;

  @IsUrl()
  @MaxLength(100)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  websiteUrl: string;
}
