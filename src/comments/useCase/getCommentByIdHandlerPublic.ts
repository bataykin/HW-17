import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Inject, NotFoundException } from "@nestjs/common";
import { ICommentsRepo, ICommentsRepoToken } from "../DAL/ICommentsRepo";
import { CommentEntity } from "../entities/comment.entity";
import { ILikesRepo, ILikesRepoToken } from "../../likes/DAL/ILikesRepo";
import { LikeEntity } from "../../likes/entities/like.entity";
import { AuthService } from "../../auth/authService";

export class GetCommentByIdPublicQuery {
  constructor(public readonly commentId: string) {}
}

@QueryHandler(GetCommentByIdPublicQuery)
export class GetCommentByIdHandlerPublic
  implements IQueryHandler<GetCommentByIdPublicQuery>
{
  constructor(
    @Inject(ICommentsRepoToken)
    private readonly commentsRepo: ICommentsRepo<CommentEntity>,
    @Inject(ILikesRepoToken)
    private readonly likesRepo: ILikesRepo<LikeEntity>,
    private readonly authService: AuthService,
  ) {}

  async execute(query: GetCommentByIdPublicQuery): Promise<any> {
    const { commentId } = query;

    const comment = await this.commentsRepo.findCommentById(commentId);
    if (!comment) {
      throw new NotFoundException("net takogo commentId");
    }
    const mappedComment = await this.commentsRepo.mapCommentToResponsePublic(
      comment,
    );
    // const result = {
    //   pagesCount: Math.ceil(docCount / +paging.pageSize),
    //   page: +paging.pageNumber,
    //   pageSize: +paging.pageSize,
    //   totalCount: +docCount,
    //   items: mappedBlogs,
    // };
    return mappedComment;
  }
}
