import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import {
  ForbiddenException,
  Inject,
  UnauthorizedException,
} from "@nestjs/common";
import {
  IUsersQueryRepo,
  IUsersQueryRepoToken,
} from "../../../users/DAL/IUserQueryRepo";
import { UserEntity } from "../../../users/entity/user.entity";
import { jwtConstants } from "../../../auth/constants";
import { JwtService } from "@nestjs/jwt";
import { IGamesRepo, IGamesRepoToken } from "../../DAL/games/IGamesRepo";
import { GameEntity } from "../../DAL/games/GameEntity";
import { GameViewModel } from "../../dto/game/GameViewModel";

export class JoinGameCommand {
  constructor(public readonly accessToken: string) {}
}

@CommandHandler(JoinGameCommand)
export class JoinGameHandler implements ICommandHandler<JoinGameCommand> {
  constructor(
    @Inject(IGamesRepoToken)
    private readonly gamesRepo: IGamesRepo<GameEntity>,
    @Inject(IUsersQueryRepoToken)
    private readonly usersQueryRepo: IUsersQueryRepo<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: JoinGameCommand): Promise<GameViewModel> {
    const { accessToken } = command;
    const retrievedUserFromToken = accessToken
      ? await this.jwtService.verify(accessToken, {
          secret: jwtConstants.secret,
        })
      : null;
    const userFromToken = retrievedUserFromToken
      ? await this.usersQueryRepo.findById(retrievedUserFromToken.userId)
      : null;
    if (!userFromToken) throw new UnauthorizedException("no user");

    const curGame = await this.gamesRepo.getCurrentGame(userFromToken);
    if (curGame) throw new ForbiddenException("current game already");

    const game: GameEntity = await this.gamesRepo.connectToGame(userFromToken);
    const mappedGame: GameViewModel = await this.gamesRepo.mapGameToView(game);
    return mappedGame;
  }
}
