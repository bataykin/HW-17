import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { IPostsRepo, IPostsRepoToken } from "../DAL/IPostsRepo";
import { PostEntity } from "../entities/post.entity";
import { PaginationPostsDto } from "../dto/pagination.posts.dto";
import { ILikesRepo, ILikesRepoToken } from "../../likes/DAL/ILikesRepo";
import { LikeEntity } from "../../likes/entities/like.entity";
import { AuthService } from "../../auth/authService";

export class GetAllPostsCommand {
  constructor(
    public readonly paginationDto: PaginationPostsDto,
    public readonly accessToken: string,
  ) {}
}

@QueryHandler(GetAllPostsCommand)
export class GetAllPostsHandler implements IQueryHandler<GetAllPostsCommand> {
  constructor(
    @Inject(IPostsRepoToken)
    private readonly postsRepo: IPostsRepo<PostEntity>,
    @Inject(ILikesRepoToken)
    private readonly likesRepo: ILikesRepo<LikeEntity>,
    private readonly authService: AuthService,
  ) {}

  async execute(query: GetAllPostsCommand): Promise<any> {
    const { paginationDto, accessToken } = query;
    const {
      pageNumber = 1,
      pageSize = 10,
      sortBy = "createdAt",
      sortDirection = "desc",
      skipSize = +pageNumber > 1 ? +pageSize * (+pageNumber - 1) : 0,
    } = paginationDto;
    const postsPaginationBLLdto = {
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      skipSize,
    };
    const posts = await this.postsRepo.getPostsPaginated(postsPaginationBLLdto);
    const retrievedUserFromToken = accessToken
      ? await this.authService.retrieveUser(accessToken)
      : undefined;
    const userIdFromToken = retrievedUserFromToken
      ? retrievedUserFromToken.userId
      : undefined;

    // const mappedPosts = await Promise.all(posts.map(async (p: PostEntity) => {
    //     const {likes,  ...rest} = p
    //     const likesDislikesCount = await this.likesRepo.getPostLikeDislikeCounts(p.id)
    //     const status = (userIdFromToken)
    //         ? await this.likesRepo.getPostLikeStatus(userIdFromToken, p.id)
    //         : LikeStatusEnum.None
    //     const lastLikes = await this.likesRepo.getLastLikesOnPost(p.id)
    //     const extendedLikesInfo = {
    //         likesCount: +likesDislikesCount.likesCount,
    //         dislikesCount: +likesDislikesCount.dislikesCount,
    //         myStatus: status,
    //         newestLikes: lastLikes
    //
    //     }
    //     const res = {
    //         ...rest, /*extendedLikesInfo*/
    //     }
    //     return res
    // }))
    const mappedPosts = await this.likesRepo.mapArrayPostEntitiesToResponse(
      posts,
      userIdFromToken,
    );

    const docCount = await this.postsRepo.countPosts();
    const result = {
      pagesCount: Math.ceil(docCount / +pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: docCount,
      items: mappedPosts,
    };
    return Promise.resolve(result);
  }
}
