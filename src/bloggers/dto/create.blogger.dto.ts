import { IsNotEmpty, IsUrl, MaxLength } from "class-validator";
import { Transform, TransformFnParams } from "class-transformer";

export class CreateBloggerDto {
  // @IsString()
  @MaxLength(15)
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  name: string;

  @MaxLength(500)
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  description: string;

  @IsUrl({ stopAtFirstError: true })
  @MaxLength(100)
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  websiteUrl: string;
}
