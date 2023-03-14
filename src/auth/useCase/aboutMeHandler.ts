import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { jwtConstants } from "../constants";
import { Inject, UnauthorizedException } from "@nestjs/common";
import {
  IUsersQueryRepo,
  IUsersQueryRepoToken,
} from "../../users/DAL/IUserQueryRepo";
import { UserEntity } from "../../users/entity/user.entity";
import { JwtService } from "@nestjs/jwt";

export class AboutMeCommand {
  constructor(public readonly token: string) {}
}

@QueryHandler(AboutMeCommand)
export class AboutMeHandler implements IQueryHandler<AboutMeCommand> {
  constructor(
    @Inject(IUsersQueryRepoToken)
    private readonly usersQueryRepo: IUsersQueryRepo<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}
  async execute(query: AboutMeCommand): Promise<any> {
    const retrievedUserFromToken = query.token
      ? await this.jwtService.verify(query.token, {
          secret: jwtConstants.secret,
        })
      : null;
    const userFromToken = retrievedUserFromToken
      ? await this.usersQueryRepo.findById(retrievedUserFromToken.userId)
      : null;
    if (!userFromToken) {
      throw new UnauthorizedException(" go away ");
    } else
      return {
        email: userFromToken.email,
        login: userFromToken.login,
        userId: userFromToken.id,
      };
  }
}
