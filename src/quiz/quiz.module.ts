import { Module } from "@nestjs/common";
import { QuizQuestionsController } from "./quizQuestionsController";
import { CreateQuestionsHandler } from "./useCase/questions/CreateQuestionHandler";
import { DeleteQuestionHandler } from "./useCase/questions/DeleteQuestionHandler";
import { PublishQuestionHandler } from "./useCase/questions/PublishQuestionHandler";
import { UpdateQuestionHandler } from "./useCase/questions/UpdateQuestionHandler";
import { GetAllQuestionsHandler } from "./useCase/questions/GetAllQuestionsHandler";
import { CqrsModule } from "@nestjs/cqrs";
import { IQuestionsRepoToken } from "./DAL/questions/IQuestionsRepo";
import { QuestionsSQLRepo } from "./DAL/questions/QuestionsSQLRepo";
import { TypeOrmModule } from "@nestjs/typeorm";
import { QuestionEntity } from "./DAL/questions/QuestionEntity";
import { QuizGameContoller } from "./quizGameController";
import { GetCurrentGameHandler } from "./useCase/game/GetCurrentGameHandler";
import { GetGameByIdHandler } from "./useCase/game/GetGameByIdHandler";
import { JoinGameHandler } from "./useCase/game/JoinGameHandler";
import { SendAnswerHandler } from "./useCase/game/SendAnswerHandler";
import { GameEntity } from "./DAL/games/GameEntity";
import { AnswerEntity } from "./DAL/answers/AnswerEntity";
import { JwtService } from "@nestjs/jwt";
import { IUsersQueryRepoToken } from "../users/DAL/IUserQueryRepo";
import { UsersSQLQueryRepo } from "../users/DAL/users.SQL.QueryRepo";
import { IGamesRepoToken } from "./DAL/games/IGamesRepo";
import { GamesSQLRepo } from "./DAL/games/GamesSQLRepo";
import { GetAllMyGamesHandler } from "./useCase/game/GetAllMyGamesHandler";
import { GetMyStatisticsHandler } from "./useCase/game/GetMyStatisticsHandler";
import { GetTopPlayersHandler } from "./useCase/game/GetTopPlayersHandler";

const questionsHandlers = [
  CreateQuestionsHandler,
  DeleteQuestionHandler,
  PublishQuestionHandler,
  UpdateQuestionHandler,
  GetAllQuestionsHandler,
];
const gameHandlers = [
  GetCurrentGameHandler,
  GetGameByIdHandler,
  JoinGameHandler,
  SendAnswerHandler,
  GetAllMyGamesHandler,
  GetMyStatisticsHandler,
  GetTopPlayersHandler,
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([QuestionEntity, GameEntity, AnswerEntity]),
  ],

  controllers: [QuizQuestionsController, QuizGameContoller],

  providers: [
    ...questionsHandlers,
    ...gameHandlers,
    JwtService,
    { provide: IUsersQueryRepoToken, useClass: UsersSQLQueryRepo },
    { provide: IQuestionsRepoToken, useClass: QuestionsSQLRepo },
    { provide: IGamesRepoToken, useClass: GamesSQLRepo },
  ],

  exports: [],
})
export class QuizModule {}
