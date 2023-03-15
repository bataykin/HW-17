import { GameStatusEnum } from "./GameStatusEnum";
import { GameProgressViewModel } from "./GameProgressViewModel";

export class GameViewModel {
  id: string;
  firstPlayerProgress: GameProgressViewModel;
  secondPlayerProgress: GameProgressViewModel;
  questions:
    | {
        id: string;
        body: string;
      }[]
    | [];
  status: GameStatusEnum;
  pairCreatedDate: Date;
  startGameDate: Date;
  finishGameDate: Date;
}
