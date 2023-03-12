import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { LikeStatusEnum } from "../../likes/LikeStatusEnum";
import { Inject, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../../auth/authService";
import { ILikesRepo, ILikesRepoToken } from "../../likes/DAL/ILikesRepo";
import { LikeEntity } from "../../likes/entities/like.entity";
import { IUsersRepoToken } from "../../users/DAL/IUsersRepo";
import { UserEntity } from "../../users/entity/user.entity";
import { IUsersQueryRepo } from "../../users/DAL/IUserQueryRepo";

export class SetLikeStatusCommand {
  constructor(
    public readonly commentId: string,
    public readonly likeStatus: LikeStatusEnum,
    public readonly accessToken: string,
  ) {}
}

@CommandHandler(SetLikeStatusCommand)
export class SetLikeStatusHandler
  implements ICommandHandler<SetLikeStatusCommand>
{
  constructor(
    /*@Inject(ICommentsRepoToken)
                private readonly commentsRepo: ICommentsRepo<CommentEntity>,*/
    @Inject(ILikesRepoToken)
    private readonly likesRepo: ILikesRepo<LikeEntity>,
    private readonly authService: AuthService,
    @Inject(IUsersRepoToken)
    private readonly usersQueryRepo: IUsersQueryRepo<UserEntity>,
  ) {}

  async execute(command: SetLikeStatusCommand): Promise<any> {
    const { likeStatus, commentId, accessToken } = command;
    const retrievedUserFromToken = accessToken
      ? await this.authService.retrieveUser(accessToken)
      : undefined;
    const userIdFromToken = retrievedUserFromToken
      ? retrievedUserFromToken.userId
      : undefined;
    const isBanned = await this.usersQueryRepo.getBanStatus(userIdFromToken);
    if (isBanned) throw new UnauthorizedException("user is banned, sorry))");
    const res = userIdFromToken
      ? await this.likesRepo.addReactionToComment(
          userIdFromToken,
          commentId,
          likeStatus,
        )
      : undefined;

    return res;
  }
}
