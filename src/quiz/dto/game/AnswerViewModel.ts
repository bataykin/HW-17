import { AnswerStatusEnum } from "./AnswerStatusEnum";
import { IsDate, IsEnum, IsUUID } from "class-validator";

export class AnswerViewModel {
  @IsUUID()
  questionId: string;

  @IsEnum(AnswerStatusEnum)
  answerStatus: AnswerStatusEnum;

  @IsDate()
  addedAt: Date;
}
