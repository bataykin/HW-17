import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import {
  ForbiddenException,
  Inject,
  UnauthorizedException,
} from "@nestjs/common";
import { AnswerInputModel } from "../../dto/game/AnswerInputModel";
import { jwtConstants } from "../../../auth/constants";
import { IGamesRepo, IGamesRepoToken } from "../../DAL/games/IGamesRepo";
import { GameEntity } from "../../DAL/games/GameEntity";
import {
  IUsersQueryRepo,
  IUsersQueryRepoToken,
} from "../../../users/DAL/IUserQueryRepo";
import { UserEntity } from "../../../users/entity/user.entity";
import { JwtService } from "@nestjs/jwt";
import { AnswerViewModel } from "../../dto/game/AnswerViewModel";

export class SendAnswerCommand {
  constructor(
    public readonly answer: AnswerInputModel,
    public readonly accessToken: string,
  ) {}
}

@CommandHandler(SendAnswerCommand)
export class SendAnswerHandler implements ICommandHandler<SendAnswerCommand> {
  constructor(
    @Inject(IGamesRepoToken)
    private readonly gamesRepo: IGamesRepo<GameEntity>,
    @Inject(IUsersQueryRepoToken)
    private readonly usersQueryRepo: IUsersQueryRepo<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: SendAnswerCommand): Promise<AnswerViewModel> {
    const { answer, accessToken } = command;
    const retrievedUserFromToken = accessToken
      ? await this.jwtService.verify(accessToken, {
          secret: jwtConstants.secret,
        })
      : null;
    const userFromToken = retrievedUserFromToken
      ? await this.usersQueryRepo.findById(retrievedUserFromToken.userId)
      : null;
    if (!userFromToken) throw new UnauthorizedException("no user");

    const activeGame = await this.gamesRepo.getActiveGame(userFromToken);
    if (!activeGame) throw new ForbiddenException("no active game");

    const nextQuestion = await this.gamesRepo.getNextQuestion(
      activeGame,
      userFromToken,
    );
    if (!nextQuestion) throw new ForbiddenException("no question");

    const checkAnswer = await this.gamesRepo.checkAnswer(nextQuestion, answer);

    // console.log(answer.answer, nextQuestion, checkAnswer);

    const sendedAnswer = await this.gamesRepo.sendAnswer(
      userFromToken,
      activeGame,
      nextQuestion,
      checkAnswer,
      answer.answer,
    );
    const currScore =
      activeGame.firstPlayerScore + " : " + activeGame.secondPlayerScore;
    console.log(currScore);

    const isQuestionStillExists = await this.gamesRepo.getNextQuestion(
      activeGame,
      userFromToken,
    );
    if (!isQuestionStillExists) {
      //
      console.log(`${userFromToken.id} finished...`);
      const activeGameFirst = await this.gamesRepo.getActiveGame(userFromToken);
      console.log(activeGameFirst);

      const score = await this.gamesRepo.calculateUserScore(
        userFromToken,
        activeGameFirst,
      );
    }

    return sendedAnswer;
  }
}
