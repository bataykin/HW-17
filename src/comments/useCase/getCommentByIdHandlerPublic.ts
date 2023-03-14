import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Inject, NotFoundException } from "@nestjs/common";
import { ICommentsRepo, ICommentsRepoToken } from "../DAL/ICommentsRepo";
import { CommentEntity } from "../entities/comment.entity";
import { ILikesRepo, ILikesRepoToken } from "../../likes/DAL/ILikesRepo";
import { LikeEntity } from "../../likes/entities/like.entity";
import {
  IUsersQueryRepo,
  IUsersQueryRepoToken,
} from "../../users/DAL/IUserQueryRepo";
import { UserEntity } from "../../users/entity/user.entity";
import { JwtService } from "@nestjs/jwt";
import { jwtConstants } from "../../auth/constants";
import { CommentViewPublicDTO } from "../dto/CommentViewPublicDTO";

export class GetCommentByIdPublicQuery {
  constructor(
    public readonly commentId: string,
    public readonly accessToken: string,
  ) {}
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
    @Inject(IUsersQueryRepoToken)
    private readonly usersQueryRepo: IUsersQueryRepo<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    query: GetCommentByIdPublicQuery,
  ): Promise<CommentViewPublicDTO> {
    const { commentId, accessToken } = query;
    const retrievedUserFromToken = accessToken
      ? await this.jwtService.verify(accessToken, {
          secret: jwtConstants.secret,
        })
      : null;
    const userIdFromToken = retrievedUserFromToken
      ? await this.usersQueryRepo.findById(retrievedUserFromToken.userId)
      : null;

    const comment = await this.commentsRepo.findCommentById(commentId);
    if (!comment) {
      throw new NotFoundException("net takogo commentId");
    }
    const mappedComment = await this.commentsRepo.mapCommentToResponsePublic(
      comment,
      userIdFromToken,
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
