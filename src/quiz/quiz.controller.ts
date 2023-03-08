import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";
import { BlogsPaginationDto } from "../bloggers/dto/blogsPaginationDto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("pair-game-quiz")
export class QuizController {
  constructor(/*protected readonly quizService: QuizSQLService,
                private readonly authService: AuthMongoService*/) {}

  @UseGuards(JwtAuthGuard)
  @Get("pairs/my-current")
  @HttpCode(200)
  async getCurrentGame(@Request() req) {
    // const token = req.headers.authorization.split(' ')[1]
    // const retrievedUserFromToken = await this.authService.retrieveUser(token)
    // const userId = retrievedUserFromToken.sub
    // return 'Returns current pair in which current user is taking part'
  }

  @UseGuards(JwtAuthGuard)
  @Get("pairs/my")
  @HttpCode(200)
  async getAllMyGames(@Query() dto: BlogsPaginationDto, @Request() req) {
    // const token = req.headers.authorization.split(' ')[1]
    // const retrievedUserFromToken = await this.authService.retrieveUser(token)
    // const userId = retrievedUserFromToken.sub
    //
    // return await this.quizService.getAllMyGames(userId, dto)
    // return 'Returns all games where current user is'
  }

  @UseGuards(JwtAuthGuard)
  @Get("pairs/:id")
  @HttpCode(200)
  async getGameById(@Param("id") gameId: string, @Request() req) {
    // const token = req.headers.authorization.split(' ')[1]
    // const retrievedUserFromToken = await this.authService.retrieveUser(token)
    // const userId = retrievedUserFromToken.sub
    //
    // return await this.quizService.getGameById(userId, gameId)
    // return `Returns pair by id = ${gameId} if current user is taking part in this pair`
  }

  @UseGuards(JwtAuthGuard)
  @Post("pairs/connection")
  @HttpCode(200)
  async joinGameOrCreate(@Request() req) {
    // const token = req.headers.authorization.split(' ')[1]
    // const retrievedUserFromToken = await this.authService.retrieveUser(token)
    // const userId = retrievedUserFromToken.sub
    //
    // return await this.quizService.joinOrCreateGame(userId)
  }

  @UseGuards(JwtAuthGuard)
  @Post("pairs/my-current/answers")
  @HttpCode(200)
  async sendAnswer(@Body() answer: string, @Request() req) {
    // const token = req.headers.authorization.split(' ')[1]
    // const retrievedUserFromToken = await this.authService.retrieveUser(token)
    // const userId = retrievedUserFromToken.sub
    //
    // return await this.quizService.sendAnswer(userId, answer)
    // return `Returns answer result`
  }

  @Get("users/top")
  @HttpCode(200)
  async getTopUsers(@Query() dto: BlogsPaginationDto) {
    // console.log(process.env.MONGO_URI)
    // return await this.quizService.getTopUsers(dto)
    // return 'Returns users TOP-X'
  }
}
