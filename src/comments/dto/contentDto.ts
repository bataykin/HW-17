import { Length } from "class-validator";

export class ContentDto {
  @Length(20, 300, {
    // message: `content is too short. Minimal length is $constraint1 characters, but actual is $value ,
    // target is $target`
  })
  content: string;
}
