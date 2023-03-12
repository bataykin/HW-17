import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { BlogsPaginationDto } from "../dto/blogsPaginationDto";
import { AuthService } from "../../auth/authService";
import { IPostsRepo, IPostsRepoToken } from "../../posts/DAL/IPostsRepo";
import { PostEntity } from "../../posts/entities/post.entity";
import { ILikesRepo, ILikesRepoToken } from "../../likes/DAL/ILikesRepo";
import { LikeEntity } from "../../likes/entities/like.entity";

export class GetPostsByBlogQuery {
  constructor(
    public readonly bloggerId: string,
    public readonly dto: BlogsPaginationDto,
  ) {}
}

@QueryHandler(GetPostsByBlogQuery)
export class GetPostsByBlogHandler
  implements IQueryHandler<GetPostsByBlogQuery>
{
  constructor(
    @Inject(IPostsRepoToken)
    private readonly postsRepo: IPostsRepo<PostEntity>,
    @Inject(ILikesRepoToken)
    private readonly likesRepo: ILikesRepo<LikeEntity>,
    private readonly authService: AuthService,
  ) {}

  async execute(query: GetPostsByBlogQuery): Promise<any> {
    const {
      searchNameTerm = "",
      pageNumber = 1,
      pageSize = 10,
      sortBy = "createdAt",
      sortDirection = "desc",
      skipSize = +pageNumber > 1 ? +pageSize * (+pageNumber - 1) : 0,
    } = query.dto;
    const postsPaginationBLLdto = {
      searchNameTerm,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      skipSize,
    };
    const { bloggerId } = query;
    const posts = await this.postsRepo.getPostsPaginatedByBlog(
      postsPaginationBLLdto,
      bloggerId,
    );
    const mappedPosts = await this.likesRepo.mapArrayPostEntitiesToResponse(
      posts,
    );

    const docCount = await this.postsRepo.countPostsByBlogId(bloggerId);
    const result = {
      pagesCount: Math.ceil(docCount / pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: docCount,
      items: mappedPosts,
    };
    return result;
  }
}
