import { Module } from "@nestjs/common";
import { QuizController } from "./quiz.controller";
import { CreateQuestionsHandler } from "./useCase/CreateQuestionHandler";
import { DeleteQuestionHandler } from "./useCase/DeleteQuestionHandler";
import { PublishQuestionHandler } from "./useCase/PublishQuestionHandler";
import { UpdateQuestionHandler } from "./useCase/UpdateQuestionHandler";
import { GetAllQuestionsHandler } from "./useCase/GetAllQuestionsHandler";
import { CqrsModule } from "@nestjs/cqrs";
import { IQuestionsRepoToken } from "./DAL/IQuestionsRepo";
import { QuestionsSQLRepo } from "./DAL/QuestionsSQLRepo";
import { TypeOrmModule } from "@nestjs/typeorm";
import { QuestionEntity } from "./DAL/QuestionEntity";

const quizHandlers = [
  CreateQuestionsHandler,
  DeleteQuestionHandler,
  PublishQuestionHandler,
  UpdateQuestionHandler,
  GetAllQuestionsHandler,
];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([QuestionEntity])],

  controllers: [QuizController],

  providers: [
    ...quizHandlers,
    {
      provide: IQuestionsRepoToken,
      useClass: QuestionsSQLRepo,
    },
  ],

  exports: [],
})
export class QuizModule {}
