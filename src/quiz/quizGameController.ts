import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { SkipThrottle } from "@nestjs/throttler";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { GetCurrentGameQuery } from "./useCase/game/GetCurrentGameHandler";
import { GetGameByIdQuery } from "./useCase/game/GetGameByIdHandler";
import { JoinGameCommand } from "./useCase/game/JoinGameHandler";
import { AnswerInputModel } from "./dto/game/AnswerInputModel";
import { SendAnswerCommand } from "./useCase/game/SendAnswerHandler";

@SkipThrottle()
@Controller("pair-game-quiz/pairs")
export class QuizGameContoller {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get("my-current")
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async getCurrentGame(@Request() req) {
    const accessToken = req.headers.authorization?.split(" ")[1];
    return this.queryBus.execute(new GetCurrentGameQuery(accessToken));
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async getGameById(
    @Request() req,
    @Param("id", ParseUUIDPipe) gameId: string,
  ) {
    const accessToken = req.headers.authorization?.split(" ")[1];
    return this.queryBus.execute(new GetGameByIdQuery(gameId, accessToken));
  }

  @Post("connection")
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async joinGame(@Request() req) {
    const accessToken = req.headers.authorization?.split(" ")[1];
    return this.commandBus.execute(new JoinGameCommand(accessToken));
  }

  @Post("my-current/answers")
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  async sendAnswerToGame(@Request() req, @Body() answer: AnswerInputModel) {
    const accessToken = req.headers.authorization?.split(" ")[1];
    return this.commandBus.execute(new SendAnswerCommand(answer, accessToken));
  }
}
