import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Inject, NotFoundException } from "@nestjs/common";
import { ICommentsRepo, ICommentsRepoToken } from "../DAL/ICommentsRepo";
import { CommentEntity } from "../entities/comment.entity";
import { ILikesRepo, ILikesRepoToken } from "../../likes/DAL/ILikesRepo";
import { LikeEntity } from "../../likes/entities/like.entity";
import { AuthService } from "../../auth/authService";

export class GetCommentByIdQuery {
  constructor(
    public readonly commentId: string,
    public readonly accessToken: string,
  ) {}
}

@QueryHandler(GetCommentByIdQuery)
export class GetCommentByIdHandler
  implements IQueryHandler<GetCommentByIdQuery>
{
  constructor(
    @Inject(ICommentsRepoToken)
    private readonly commentsRepo: ICommentsRepo<CommentEntity>,
    @Inject(ILikesRepoToken)
    private readonly likesRepo: ILikesRepo<LikeEntity>,
    private readonly authService: AuthService,
  ) {}

  async execute(query: GetCommentByIdQuery): Promise<any> {
    const { commentId, accessToken } = query;
    const retrievedUserFromToken = accessToken
      ? await this.authService.retrieveUser(accessToken)
      : undefined;
    const userIdFromToken = retrievedUserFromToken
      ? retrievedUserFromToken.userId
      : undefined;

    const comment = await this.commentsRepo.findCommentById(commentId);
    if (!comment) {
      throw new NotFoundException("net takogo commentId");
    }
    const mappedComment =
      await this.likesRepo.mapLikesToCommentEntityToResponse(
        comment,
        userIdFromToken,
      );
    return mappedComment;
  }
}
