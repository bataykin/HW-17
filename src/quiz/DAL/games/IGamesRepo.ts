import { UserEntity } from "../../../users/entity/user.entity";
import { AnswerInputModel } from "../../dto/game/AnswerInputModel";
import { GameViewModel } from "../../dto/game/GameViewModel";
import { AnswerViewModel } from "../../dto/game/AnswerViewModel";
import { GameEntity } from "./GameEntity";
import { QuestionEntity } from "../questions/QuestionEntity";
import { AnswerStatusEnum } from "../../dto/game/AnswerStatusEnum";
import { GamesPaginationDTO } from "../../dto/game/GamesPaginationDTO";

export const IGamesRepoToken = Symbol("IGamesRepoToken");
export interface IGamesRepo<GenericGameType> {
  connectToGame(user: UserEntity): Promise<GenericGameType>;
  getCurrentGame(user: UserEntity): Promise<GenericGameType>;

  getAllUsersGames(
    user: UserEntity,
    dto: GamesPaginationDTO,
  ): Promise<GenericGameType[]>;
  getGameById(gameId: string): Promise<GenericGameType>;
  sendAnswer(
    user: UserEntity,
    game: GameEntity,
    question: QuestionEntity,
    answerStatus: AnswerStatusEnum,
    answer: string,
  ): Promise<AnswerViewModel>;

  mapGameToView(game: GenericGameType): Promise<GameViewModel>;

  mapGamesToView(games: GenericGameType[]): Promise<GameViewModel[]>;

  getActiveGame(user: UserEntity): Promise<GenericGameType>;
  getNextQuestion(
    game: GenericGameType,
    user: UserEntity,
  ): Promise<QuestionEntity>;

  mapQuestionToView(question: QuestionEntity): Promise<{
    id: string;
    body: string;
  }>;

  mapQuestionsToView(questions: QuestionEntity[]): Promise<
    {
      id: string;
      body: string;
    }[]
  >;

  checkAnswer(
    question: QuestionEntity,
    answer: AnswerInputModel,
  ): Promise<AnswerStatusEnum>;

  calculateUserScore(user: UserEntity, game: GenericGameType): Promise<void>;

  countMyGames(user: UserEntity): Promise<number>;
}
