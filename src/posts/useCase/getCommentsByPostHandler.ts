import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { PaginationPostsDto } from "../dto/pagination.posts.dto";
import {
  ICommentsRepo,
  ICommentsRepoToken,
} from "../../comments/DAL/ICommentsRepo";
import { CommentEntity } from "../../comments/entities/comment.entity";
import { ILikesRepo, ILikesRepoToken } from "../../likes/DAL/ILikesRepo";
import { LikeEntity } from "../../likes/entities/like.entity";
import { PaginationCommentsDto } from "../../comments/dto/paginationCommentsDto";
import { PaginatorModel } from "../../common/PaginatorModel";
import { CommentViewPublicDTO } from "../../comments/dto/CommentViewPublicDTO";

export class GetCommentsByPostCommandPublic {
  constructor(
    public readonly postId: string,
    public readonly dto: PaginationPostsDto,
  ) {}
}

@QueryHandler(GetCommentsByPostCommandPublic)
export class GetCommentsByPostHandler
  implements IQueryHandler<GetCommentsByPostCommandPublic>
{
  constructor(
    @Inject(ICommentsRepoToken)
    private readonly commentsRepo: ICommentsRepo<CommentEntity>,
    @Inject(ILikesRepoToken)
    private readonly likesRepo: ILikesRepo<LikeEntity>,
  ) {}

  async execute(
    query: GetCommentsByPostCommandPublic,
  ): Promise<PaginatorModel<CommentViewPublicDTO[]>> {
    const { postId, dto } = query;
    // console.log(accessToken)

    const paging: PaginationCommentsDto = {
      sortBy: dto.sortBy ?? "createdAt",
      sortDirection: dto.sortDirection ?? "desc",
      pageNumber: dto.pageNumber ?? 1,
      pageSize: dto.pageSize ?? 10,
      skipSize: dto.pageNumber > 1 ? dto.pageSize * (dto.pageNumber - 1) : 0,
    };
    const comments = await this.commentsRepo.getCommentsByPost(postId, paging);
    const mappedComments: CommentViewPublicDTO[] =
      await this.commentsRepo.mapCommentsToResponsePublic(comments);
    const docCount = await this.commentsRepo.countCommentsOnPost(
      postId,
      paging,
    );
    const result = {
      pagesCount: Math.ceil(docCount / paging.pageSize),
      page: paging.pageNumber,
      pageSize: paging.pageSize,
      totalCount: +docCount,
      items: mappedComments,
    };
    return result;
  }
}
