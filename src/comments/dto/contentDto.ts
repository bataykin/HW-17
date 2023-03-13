import { Length } from "class-validator";

export class ContentDto {
  @Length(20, 300)
  content: string;
}
