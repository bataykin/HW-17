import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { QuestionsPaginationDTO } from "./dto/questionsPaginationDTO";
import { QuestionInputModel } from "./dto/QuestionInputModel";
import { QuestionPublishInputModel } from "./dto/QuestionPublishInputModel";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { GetAllQuestionsQuery } from "./useCase/GetAllQuestionsHandler";
import { CreateQuestionCommand } from "./useCase/CreateQuestionHandler";
import { DeleteQuestionCommand } from "./useCase/DeleteQuestionHandler";
import { UpdateQuestionCommand } from "./useCase/UpdateQuestionHandler";
import { PublishQuestionCommand } from "./useCase/PublishQuestionHandler";
import { SkipThrottle } from "@nestjs/throttler";
import { BaseAuthGuard } from "../guards/base.auth.guard";

@SkipThrottle()
@Controller("sa/quiz/questions")
export class QuizController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @UseGuards(BaseAuthGuard)
  @HttpCode(200)
  async getAllQuestions(@Query() dto: QuestionsPaginationDTO) {
    return this.queryBus.execute(new GetAllQuestionsQuery(dto));
  }

  @Post()
  @UseGuards(BaseAuthGuard)
  @HttpCode(201)
  async createQuestion(@Body() dto: QuestionInputModel) {
    return this.commandBus.execute(new CreateQuestionCommand(dto));
  }

  @Delete("/:id")
  @UseGuards(BaseAuthGuard)
  @HttpCode(204)
  async deleteQuestionById(@Param("id", ParseUUIDPipe) questionId: string) {
    return this.commandBus.execute(new DeleteQuestionCommand(questionId));
  }

  @Put("/:id")
  @UseGuards(BaseAuthGuard)
  @HttpCode(204)
  async updateQuestionById(
    @Param("id", ParseUUIDPipe) questionId: string,
    @Body() dto: QuestionInputModel,
  ) {
    return this.commandBus.execute(new UpdateQuestionCommand(questionId, dto));
  }

  @Put("/:id/publish")
  @UseGuards(BaseAuthGuard)
  @HttpCode(204)
  async publishQuestionById(
    @Param("id", ParseUUIDPipe) questionId: string,
    @Body() dto: QuestionPublishInputModel,
  ) {
    return this.commandBus.execute(new PublishQuestionCommand(questionId, dto));
  }
}
