import { UserEntity } from "../../../users/entity/user.entity";
import { AnswerInputModel } from "../../dto/game/AnswerInputModel";
import { GameViewModel } from "../../dto/game/GameViewModel";
import { AnswerViewModel } from "../../dto/game/AnswerViewModel";
import { GameEntity } from "./GameEntity";
import { QuestionEntity } from "../questions/QuestionEntity";
import { AnswerStatusEnum } from "../../dto/game/AnswerStatusEnum";

export const IGamesRepoToken = Symbol("IGamesRepoToken");
export interface IGamesRepo<GenericGameType> {
  connectToGame(user: UserEntity): Promise<GenericGameType>;
  getCurrentGame(user: UserEntity): Promise<GenericGameType>;
  getGameById(user: UserEntity, gameId: string): Promise<GenericGameType>;
  sendAnswer(
    user: UserEntity,
    game: GameEntity,
    question: QuestionEntity,
    answerStatus: AnswerStatusEnum,
  ): Promise<AnswerViewModel>;

  mapGameToView(game: GenericGameType): Promise<GameViewModel>;

  getActiveGame(user: UserEntity): Promise<GenericGameType>;
  getLastQuestion(
    game: GenericGameType,
    user: UserEntity,
  ): Promise<QuestionEntity>;

  checkAnswer(
    question: QuestionEntity,
    answer: AnswerInputModel,
  ): Promise<AnswerStatusEnum>;
}
