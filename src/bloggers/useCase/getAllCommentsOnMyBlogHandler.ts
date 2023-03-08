import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { BlogsPaginationDto } from "../dto/blogsPaginationDto";
import { Inject, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../../auth/authService";
import { IUsersRepo, IUsersRepoToken } from "../../users/IUsersRepo";
import { UserEntity } from "../../users/entity/user.entity";
import { ICommentsRepo, ICommentsRepoToken } from "../../comments/ICommentsRepo";
import { CommentEntity } from "../../comments/entities/comment.entity";
import { ILikesRepo, ILikesRepoToken } from "../../likes/ILikesRepo";
import { LikeEntity } from "../../likes/entities/like.entity";

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
    @Inject(IUsersRepoToken)
    private readonly usersRepo: IUsersRepo<UserEntity>,
    @Inject(ILikesRepoToken)
    private readonly likesRepo: ILikesRepo<LikeEntity>,
  ) {}
  async execute(query: GetAllCommentsOnMyBlogCommand): Promise<any> {
    const { dto, accessToken } = query;
    const retrievedUserFromToken = await this.authService.retrieveUser(
      accessToken,
    );
    const userIdFromToken = retrievedUserFromToken.userId;
    const isUserExist = await this.usersRepo.findById(userIdFromToken);
    if (!isUserExist) {
      throw new UnauthorizedException("unexpected user");
    }
    const isBanned = await this.usersRepo.getBanStatus(userIdFromToken);
    if (isBanned) throw new UnauthorizedException("user is banned, sorry))");

    const {
      pageNumber = 1,
      pageSize = 10,
      sortBy = "createdAt",
      sortDirection = "desc",
      skipSize = +pageNumber > 1 ? +pageSize * (+pageNumber - 1) : 0,
    } = query.dto;
    const commentsPaginationBLLdto = {
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      skipSize,
    };

    const allComments = await this.commentsRepo.getAllCommentByBlog(
      userIdFromToken,
      commentsPaginationBLLdto,
    );
    // console.log('getAllCommentByBlog');
    // console.log(allComments);

    // const mappedComments =
    //   await this.likesRepo.mapArrayCommentEntitiesToResponse(allComments);
    const mappedComments = await this.commentsRepo.mapCommentsToResponse(
      allComments,
    );
    // console.log(mappedComments);

    const docCount = await this.commentsRepo.countAllCommentsForAllUserBlogs(
      userIdFromToken,
    );

    const result = {
      pagesCount: Math.ceil(docCount / +pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: docCount,
      items: mappedComments,
    };
    // console.log(result);
    return result;
  }
}
