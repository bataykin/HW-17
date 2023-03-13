import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { BlogsPaginationDto } from "../dto/blogsPaginationDto";
import { IPostsRepo, IPostsRepoToken } from "../../posts/DAL/IPostsRepo";
import { PostEntity } from "../../posts/entities/post.entity";
import { ILikesRepo, ILikesRepoToken } from "../../likes/DAL/ILikesRepo";
import { LikeEntity } from "../../likes/entities/like.entity";
import { jwtConstants } from "../../auth/constants";
import {
  IUsersQueryRepo,
  IUsersQueryRepoToken,
} from "../../users/DAL/IUserQueryRepo";
import { UserEntity } from "../../users/entity/user.entity";
import { JwtService } from "@nestjs/jwt";
import { PaginationBasicDto } from "../../comments/dto/paginationBasicDto";
import { PaginatorModel } from "../../common/PaginatorModel";
import { PostViewModel } from "../../posts/dto/PostViewModel";

export class GetPostsByBlogQueryPublic {
  constructor(
    public readonly blogId: string,
    public readonly dto: BlogsPaginationDto,
    public readonly accessToken: string,
  ) {}
}

@QueryHandler(GetPostsByBlogQueryPublic)
export class GetPostsByBlogHandler
  implements IQueryHandler<GetPostsByBlogQueryPublic>
{
  constructor(
    @Inject(IPostsRepoToken)
    private readonly postsRepo: IPostsRepo<PostEntity>,
    @Inject(ILikesRepoToken)
    private readonly likesRepo: ILikesRepo<LikeEntity>,
    @Inject(IUsersQueryRepoToken)
    private readonly usersQueryRepo: IUsersQueryRepo<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    query: GetPostsByBlogQueryPublic,
  ): Promise<PaginatorModel<PostViewModel[]>> {
    const { dto, blogId, accessToken } = query;
    const retrievedUserFromToken = accessToken
      ? await this.jwtService.verify(accessToken, {
          secret: jwtConstants.secret,
        })
      : null;
    const userFromToken = retrievedUserFromToken
      ? await this.usersQueryRepo.findById(retrievedUserFromToken.userId)
      : null;
    const paging: PaginationBasicDto = {
      sortBy: dto.sortBy ?? "createdAt",
      sortDirection: dto.sortDirection ?? "desc",
      pageNumber: dto.pageNumber ?? 1,
      pageSize: dto.pageSize ?? 10,
      skipSize: dto.pageNumber > 1 ? dto.pageSize * (dto.pageNumber - 1) : 0,
    };
    const posts = await this.postsRepo.getPostsPaginatedByBlog(paging, blogId);

    const mappedPosts = await this.postsRepo.mapPostsToView(
      posts,
      userFromToken,
    );

    const docCount = await this.postsRepo.countPostsByBlogId(blogId);
    const result = {
      pagesCount: Math.ceil(+docCount / +paging.pageSize),
      page: +paging.pageNumber,
      pageSize: +paging.pageSize,
      totalCount: +docCount,
      items: mappedPosts,
    };
    return result;
  }
}
