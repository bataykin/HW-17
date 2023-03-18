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
import { GameStatisticsDTO } from "../../dto/game/GameStatisticsDTO";

export class GetMyStatisticsQuery {
  constructor(public readonly accessToken: string) {}
}

@QueryHandler(GetMyStatisticsQuery)
export class GetMyStatisticsHandler
  implements IQueryHandler<GetMyStatisticsQuery>
{
  constructor(
    @Inject(IGamesRepoToken)
    private readonly gamesRepo: IGamesRepo<GameEntity>,
    @Inject(IUsersQueryRepoToken)
    private readonly usersQueryRepo: IUsersQueryRepo<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}
  async execute(query: GetMyStatisticsQuery): Promise<GameStatisticsDTO> {
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

    const stata = await this.gamesRepo.getFinishedGamesStatistics(
      userFromToken,
    );

    return stata;
  }
}
