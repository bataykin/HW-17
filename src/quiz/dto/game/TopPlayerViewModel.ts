import { GameStatisticsDTO } from "./GameStatisticsDTO";

export class TopPlayerViewModel extends GameStatisticsDTO {
  player: {
    id: string;
    login: string;
  };
}
