import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import {
  Inject,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { IGamesRepo, IGamesRepoToken } from "../../DAL/games/IGamesRepo";
import { GameEntity } from "../../DAL/games/GameEntity";
import {
  IUsersQueryRepo,
  IUsersQueryRepoToken,
} from "../../../users/DAL/IUserQueryRepo";
import { UserEntity } from "../../../users/entity/user.entity";
import { JwtService } from "@nestjs/jwt";
import { jwtConstants } from "../../../auth/constants";
import { GameViewModel } from "../../dto/game/GameViewModel";

export class GetCurrentGameQuery {
  constructor(public readonly accessToken: string) {}
}

@QueryHandler(GetCurrentGameQuery)
export class GetCurrentGameHandler
  implements IQueryHandler<GetCurrentGameQuery>
{
  constructor(
    @Inject(IGamesRepoToken)
    private readonly gamesRepo: IGamesRepo<GameEntity>,
    @Inject(IUsersQueryRepoToken)
    private readonly usersQueryRepo: IUsersQueryRepo<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}
  async execute(query: GetCurrentGameQuery): Promise<any> {
    const { accessToken } = query;
    const retrievedUserFromToken = accessToken
      ? await this.jwtService.verify(accessToken, {
          secret: jwtConstants.secret,
        })
      : null;
    const userFromToken = retrievedUserFromToken
      ? await this.usersQueryRepo.findById(retrievedUserFromToken.userId)
      : null;
    if (!userFromToken) throw new UnauthorizedException("no user");

    // const activeGame = await this.gamesRepo.getActiveGame(userFromToken);
    // if (!activeGame) throw new NotFoundException("no active game");

    const currentGame = await this.gamesRepo.getCurrentGame(userFromToken);
    if (!currentGame) throw new NotFoundException("no active game");
    // console.log(currentGame);

    const mappedGame: GameViewModel = await this.gamesRepo.mapGameToView(
      currentGame,
    );
    return mappedGame;
  }
}
