import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { BlogsPaginationDto } from "../dto/blogsPaginationDto";
import { Inject, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../../auth/authService";
import { UserEntity } from "../../users/entity/user.entity";
import {
  ICommentsRepo,
  ICommentsRepoToken,
} from "../../comments/DAL/ICommentsRepo";
import { CommentEntity } from "../../comments/entities/comment.entity";
import { ILikesRepo, ILikesRepoToken } from "../../likes/DAL/ILikesRepo";
import { LikeEntity } from "../../likes/entities/like.entity";
import {
  IUsersQueryRepo,
  IUsersQueryRepoToken,
} from "../../users/DAL/IUserQueryRepo";
import { PaginatorModel } from "../../common/PaginatorModel";
import { CommentViewForBloggerDTO } from "../dto/CommentViewForBloggerDTO";
import { PaginationBasicDto } from "../../comments/dto/paginationBasicDto";

export class GetAllCommentsOnMyBlogCommand {
  constructor(
    public readonly dto: BlogsPaginationDto,
    public readonly accessToken: string,
  ) {}
}
@QueryHandler(GetAllCommentsOnMyBlogCommand)
export class GetAllCommentsOnMyBlogHandler
  implements IQueryHandler<GetAllCommentsOnMyBlogCommand>
{
  constructor(
    @Inject(ICommentsRepoToken)
    private readonly commentsRepo: ICommentsRepo<CommentEntity>,
    private readonly authService: AuthService,
    @Inject(IUsersQueryRepoToken)
    private readonly usersQueryRepo: IUsersQueryRepo<UserEntity>,
    @Inject(ILikesRepoToken)
    private readonly likesRepo: ILikesRepo<LikeEntity>,
  ) {}
  async execute(
    query: GetAllCommentsOnMyBlogCommand,
  ): Promise<PaginatorModel<CommentViewForBloggerDTO[]>> {
    const { dto, accessToken } = query;
    const retrievedUserFromToken = await this.authService.retrieveUser(
      accessToken,
    );
    const userIdFromToken = retrievedUserFromToken.userId;
    const isUserExist = await this.usersQueryRepo.findById(userIdFromToken);
    if (!isUserExist) {
      throw new UnauthorizedException("unexpected user");
    }
    const isBanned = await this.usersQueryRepo.getBanStatus(userIdFromToken);
    if (isBanned) throw new UnauthorizedException("user is banned, sorry))");

    const paging: PaginationBasicDto = {
      sortBy: dto.sortBy ?? "createdAt",
      sortDirection: dto.sortDirection ?? "desc",
      pageNumber: dto.pageNumber ?? 1,
      pageSize: dto.pageSize ?? 10,
      skipSize: dto.pageNumber > 1 ? dto.pageSize * (dto.pageNumber - 1) : 0,
    };

    const allComments = await this.commentsRepo.getAllCommentsByBlog(
      userIdFromToken,
      paging,
    );

    const mappedComments =
      await this.commentsRepo.mapCommentsToResponseForBlogger(allComments);
    // console.log(mappedComments);

    const docCount = await this.commentsRepo.countAllCommentsForAllUserBlogs(
      userIdFromToken,
    );

    const result = {
      pagesCount: Math.ceil(docCount / +paging.pageSize),
      page: +paging.pageNumber,
      pageSize: +paging.pageSize,
      totalCount: +docCount,
      items: mappedComments,
    };
    // console.log(result);
    return result;
  }
}
