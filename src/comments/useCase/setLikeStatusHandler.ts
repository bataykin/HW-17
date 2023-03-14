import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { LikeStatusEnum } from "../../likes/LikeStatusEnum";
import { Inject, UnauthorizedException } from "@nestjs/common";
import { ILikesRepo, ILikesRepoToken } from "../../likes/DAL/ILikesRepo";
import { LikeEntity } from "../../likes/entities/like.entity";
import { UserEntity } from "../../users/entity/user.entity";
import {
  IUsersQueryRepo,
  IUsersQueryRepoToken,
} from "../../users/DAL/IUserQueryRepo";
import { JwtService } from "@nestjs/jwt";
import { jwtConstants } from "../../auth/constants";

export class SetLikeStatusCommentCommand {
  constructor(
    public readonly commentId: string,
    public readonly likeStatus: LikeStatusEnum,
    public readonly accessToken: string,
  ) {}
}

@CommandHandler(SetLikeStatusCommentCommand)
export class SetLikeStatusHandler
  implements ICommandHandler<SetLikeStatusCommentCommand>
{
  constructor(
    /*@Inject(ICommentsRepoToken)
                private readonly commentsRepo: ICommentsRepo<CommentEntity>,*/
    @Inject(ILikesRepoToken)
    private readonly likesRepo: ILikesRepo<LikeEntity>,
    @Inject(IUsersQueryRepoToken)
    private readonly usersQueryRepo: IUsersQueryRepo<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: SetLikeStatusCommentCommand): Promise<void> {
    const { likeStatus, commentId, accessToken } = command;
    const retrievedUserFromToken = accessToken
      ? await this.jwtService.verify(accessToken, {
          secret: jwtConstants.secret,
        })
      : null;
    const userIdFromToken = retrievedUserFromToken
      ? await this.usersQueryRepo.findById(retrievedUserFromToken.userId)
      : null;
    if (!userIdFromToken || userIdFromToken.isBanned) {
      throw new UnauthorizedException("user unexpected");
    }
    await this.likesRepo.setLikeStatusToComment(
      userIdFromToken.id,
      commentId,
      likeStatus,
    );
    return;
  }
}
