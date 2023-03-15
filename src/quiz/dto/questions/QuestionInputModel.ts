import { Length } from "class-validator";

export class QuestionInputModel {
  @Length(10, 500)
  body: string;
  correctAnswers: string[];
}
