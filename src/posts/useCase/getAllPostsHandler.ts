import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { IPostsRepo, IPostsRepoToken } from "../DAL/IPostsRepo";
import { PostEntity } from "../entities/post.entity";
import { PaginationPostsDto } from "../dto/pagination.posts.dto";
import { ILikesRepo, ILikesRepoToken } from "../../likes/DAL/ILikesRepo";
import { LikeEntity } from "../../likes/entities/like.entity";
import { jwtConstants } from "../../auth/constants";
import { JwtService } from "@nestjs/jwt";
import {
  IUsersQueryRepo,
  IUsersQueryRepoToken,
} from "../../users/DAL/IUserQueryRepo";
import { UserEntity } from "../../users/entity/user.entity";
import { PaginationCommentsDto } from "../../comments/dto/paginationCommentsDto";
import { PaginatorModel } from "../../common/PaginatorModel";
import { PostViewModel } from "../dto/PostViewModel";

export class GetAllPostsCommandPublic {
  constructor(
    public readonly dto: PaginationPostsDto,
    public readonly accessToken: string,
  ) {}
}

@QueryHandler(GetAllPostsCommandPublic)
export class GetAllPostsHandler
  implements IQueryHandler<GetAllPostsCommandPublic>
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
    query: GetAllPostsCommandPublic,
  ): Promise<PaginatorModel<PostViewModel[]>> {
    const { dto, accessToken } = query;
    const retrievedUserFromToken = accessToken
      ? await this.jwtService.verify(accessToken, {
          secret: jwtConstants.secret,
        })
      : null;
    const userFromToken = retrievedUserFromToken
      ? await this.usersQueryRepo.findById(retrievedUserFromToken.userId)
      : null;
    const paging: PaginationCommentsDto = {
      sortBy: dto.sortBy ?? "createdAt",
      sortDirection: dto.sortDirection ?? "desc",
      pageNumber: dto.pageNumber ?? 1,
      pageSize: dto.pageSize ?? 10,
      skipSize: dto.pageNumber > 1 ? dto.pageSize * (dto.pageNumber - 1) : 0,
    };
    const posts: PostEntity[] = await this.postsRepo.getPostsPaginated(
      paging,
      userFromToken,
    );

    const mappedPosts = await this.postsRepo.mapPostsToView(
      posts,
      userFromToken,
    );

    const docCount = await this.postsRepo.countPosts();
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
