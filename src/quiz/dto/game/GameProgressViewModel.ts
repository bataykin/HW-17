import { AnswerStatusEnum } from "./AnswerStatusEnum";

export class GameProgressViewModel {
  answers:
    | {
        questionId: string;
        answerStatus: AnswerStatusEnum;
        addedAt: Date;
      }[]
    | [];
  player: {
    id: string;
    login: string;
  };
  score: number;
}
