import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Inject, UnauthorizedException } from "@nestjs/common";
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
import { PaginatorModel } from "../../../common/PaginatorModel";
import { GamesPaginationDTO } from "../../dto/game/GamesPaginationDTO";

export class GetAllMyGamesQuery {
  constructor(
    public readonly accessToken: string,
    public readonly dto: GamesPaginationDTO,
  ) {}
}

@QueryHandler(GetAllMyGamesQuery)
export class GetAllMyGamesHandler implements IQueryHandler<GetAllMyGamesQuery> {
  constructor(
    @Inject(IGamesRepoToken)
    private readonly gamesRepo: IGamesRepo<GameEntity>,
    @Inject(IUsersQueryRepoToken)
    private readonly usersQueryRepo: IUsersQueryRepo<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}
  async execute(
    query: GetAllMyGamesQuery,
  ): Promise<PaginatorModel<GameViewModel[]>> {
    const { accessToken, dto } = query;
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

    const allGames = await this.gamesRepo.getAllUsersGames(userFromToken, dto);

    const mappedGames: GameViewModel[] = await this.gamesRepo.mapGamesToView(
      allGames,
    );
    const docCount = await this.gamesRepo.countMyGames(userFromToken);
    return {
      pagesCount: Math.ceil(docCount / dto.pageSize),
      page: dto.pageNumber,
      pageSize: dto.pageSize,
      totalCount: +docCount,
      items: mappedGames,
    };
  }
}
