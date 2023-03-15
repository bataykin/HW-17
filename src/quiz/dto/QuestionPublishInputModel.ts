import { IsBoolean } from "class-validator";

export class QuestionPublishInputModel {
  @IsBoolean()
  published: boolean;
}
