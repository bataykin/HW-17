import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject, UnauthorizedException } from "@nestjs/common";
import { ILikesRepo, ILikesRepoToken } from "../../likes/DAL/ILikesRepo";
import { LikeEntity } from "../../likes/entities/like.entity";
import { AuthService } from "../../auth/authService";
import { LikeStatusEnum } from "../../likes/LikeStatusEnum";
import {
  IUsersQueryRepo,
  IUsersQueryRepoToken,
} from "../../users/DAL/IUserQueryRepo";
import { UserEntity } from "../../users/entity/user.entity";

export class SetLikeToPostCommand {
  constructor(
    public readonly postId: string,
    public readonly likeStatus: LikeStatusEnum,
    public readonly accessToken: string,
  ) {}
}

@CommandHandler(SetLikeToPostCommand)
export class SetLikeToPostHandler
  implements ICommandHandler<SetLikeToPostCommand>
{
  constructor(
    @Inject(ILikesRepoToken)
    private readonly likesRepo: ILikesRepo<LikeEntity>,
    @Inject(IUsersQueryRepoToken)
    private readonly usersQueryRepo: IUsersQueryRepo<UserEntity>,
    private readonly authService: AuthService,
  ) {}
  async execute(command: SetLikeToPostCommand): Promise<void> {
    const { likeStatus, postId, accessToken } = command;
    const retrievedUserFromToken = await this.authService.retrieveUser(
      accessToken,
    );
    const userIdFromToken = retrievedUserFromToken.userId;
    const isUserExist = await this.usersQueryRepo.findById(userIdFromToken);
    if (!isUserExist || isUserExist.isBanned) {
      throw new UnauthorizedException("unexpected user");
    }

    const res = await this.likesRepo.setLikeStatusToPost(
      userIdFromToken,
      postId,
      likeStatus,
    );

    return res;
  }
}
