import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import {
  ForbiddenException,
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

export class GetGameByIdQuery {
  constructor(
    public readonly gameId: string,
    public readonly accessToken: string,
  ) {}
}

@QueryHandler(GetGameByIdQuery)
export class GetGameByIdHandler implements IQueryHandler<GetGameByIdQuery> {
  constructor(
    @Inject(IGamesRepoToken)
    private readonly gamesRepo: IGamesRepo<GameEntity>,
    @Inject(IUsersQueryRepoToken)
    private readonly usersQueryRepo: IUsersQueryRepo<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}
  async execute(query: GetGameByIdQuery): Promise<any> {
    const { gameId, accessToken } = query;

    const retrievedUserFromToken = accessToken
      ? await this.jwtService.verify(accessToken, {
          secret: jwtConstants.secret,
        })
      : null;
    const userFromToken = retrievedUserFromToken
      ? await this.usersQueryRepo.findById(retrievedUserFromToken.userId)
      : null;
    if (!userFromToken) throw new UnauthorizedException("no user");

    const game = await this.gamesRepo.getGameById(gameId);
    if (!game) throw new NotFoundException("no game by id");

    if (![game.firstPlayerId, game.secondPlayerId].includes(userFromToken.id))
      throw new ForbiddenException("not participated");

    const mappedGame: GameViewModel = await this.gamesRepo.mapGameToView(game);
    return mappedGame;
  }
}
