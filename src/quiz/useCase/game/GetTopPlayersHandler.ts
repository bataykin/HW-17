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
import { TopPlayersDTO } from "../../dto/game/TopPlayersDTO";
import { PaginatorModel } from "../../../common/PaginatorModel";
import { TopPlayerViewModel } from "../../dto/game/TopPlayerViewModel";

export class GetTopPlayersQuery {
  constructor(
    public readonly accessToken: string,
    public readonly dto: TopPlayersDTO,
  ) {}
}

@QueryHandler(GetTopPlayersQuery)
export class GetTopPlayersHandler implements IQueryHandler<GetTopPlayersQuery> {
  constructor(
    @Inject(IGamesRepoToken)
    private readonly gamesRepo: IGamesRepo<GameEntity>,
    @Inject(IUsersQueryRepoToken)
    private readonly usersQueryRepo: IUsersQueryRepo<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}
  async execute(
    query: GetTopPlayersQuery,
  ): Promise<PaginatorModel<TopPlayerViewModel[]>> {
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

    const topPlayers = await this.gamesRepo.getTopPlayers(dto);
    const docCount = await this.gamesRepo.countAllFinishedGames();

    return {
      pagesCount: Math.ceil(+docCount / dto.pageSize),
      page: dto.pageNumber,
      pageSize: dto.pageSize,
      totalCount: +docCount,
      items: topPlayers,
    };
  }
}
