import { MaxLength } from "class-validator";
import { Transform, TransformFnParams } from "class-transformer";

export class CreatePostDto {
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MaxLength(30)
  title: string;

  @MaxLength(100)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  shortDescription: string;

  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MaxLength(1000)
  content: string;

  // @IsUUID()
  // @IsBlogExist('blogId')
  // @Validate(IsBlogExistConstraint)
  blogId?: string;

  blogName?: string;
}
