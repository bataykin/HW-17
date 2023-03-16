import { AnswerStatusEnum } from "./AnswerStatusEnum";

export class GameProgressViewModel {
  answers: {
    questionId: string;
    answerStatus: AnswerStatusEnum;
    addedAt: Date;
  }[];
  player: {
    id: string | null;
    login: string | null;
  };
  score: number;
}
