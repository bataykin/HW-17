import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { ILikesRepo, ILikesRepoToken } from "../../likes/DAL/ILikesRepo";
import { LikeEntity } from "../../likes/entities/like.entity";
import { AuthService } from "../../auth/authService";
import { LikeStatusEnum } from "../../likes/LikeStatusEnum";

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
    private readonly authService: AuthService,
  ) {}
  async execute(command: SetLikeToPostCommand): Promise<any> {
    const { likeStatus, postId, accessToken } = command;
    const retrievedUserFromToken = accessToken
      ? await this.authService.retrieveUser(accessToken)
      : undefined;
    const userIdFromToken = retrievedUserFromToken
      ? retrievedUserFromToken.userId
      : undefined;
    const res = userIdFromToken
      ? await this.likesRepo.addReactionToPost(
          userIdFromToken,
          postId,
          likeStatus,
        )
      : undefined;

    return res;
  }
}
