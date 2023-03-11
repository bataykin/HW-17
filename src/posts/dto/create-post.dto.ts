import {
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  Validate,
} from "class-validator";
import { IsBlogExistConstraint } from "../../bloggers/decorators/isBloggerExistsDecorator";
import { Transform, TransformFnParams } from "class-transformer";

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MaxLength(30)
  title: string;

  @MaxLength(100)
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  shortDescription: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MaxLength(1000)
  content: string;

  @IsUUID()
  // @IsBlogExist('blogId')
  @Validate(IsBlogExistConstraint)
  blogId: string;

  blogName?: string;
}
