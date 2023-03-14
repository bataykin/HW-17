import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { BlogsPaginationDto } from "../dto/blogsPaginationDto";
import { Inject } from "@nestjs/common";
import { IBlogsRepo, IBlogsRepoToken } from "../DAL/IBlogsRepo";
import { BlogEntity } from "../entities/blogEntity";
import { AuthService } from "../../auth/authService";
import { IUsersRepo, IUsersRepoToken } from "../../users/DAL/IUsersRepo";
import { UserEntity } from "../../users/entity/user.entity";
import { BlogViewModel } from "../dto/BlogViewModel";
import { PaginatorModel } from "../../common/PaginatorModel";

export class GetAllBlogsQuery {
  constructor(public readonly dto: BlogsPaginationDto) {}
}

@QueryHandler(GetAllBlogsQuery)
export class GetAllBlogsPublicHandler
  implements IQueryHandler<GetAllBlogsQuery>
{
  constructor(
    @Inject(IBlogsRepoToken)
    private readonly blogsRepo: IBlogsRepo<BlogEntity>,
    private readonly authService: AuthService,
    @Inject(IUsersRepoToken)
    private readonly usersRepo: IUsersRepo<UserEntity>,
  ) {}

  async execute(
    query: GetAllBlogsQuery,
  ): Promise<PaginatorModel<BlogViewModel[]>> {
    const { dto } = query;
    const paging = {
      searchNameTerm: dto.searchNameTerm?.toUpperCase() ?? null,
      sortBy: dto.sortBy ?? "createdAt",
      sortDirection: dto.sortDirection ?? "desc",
      pageNumber: dto.pageNumber ?? 1,
      pageSize: dto.pageSize ?? 10,
      skipSize: dto.pageNumber > 1 ? dto.pageSize * (dto.pageNumber - 1) : 0,
    } as BlogsPaginationDto;

    const blogs = await this.blogsRepo.getBlogsPaginatedPublic(paging);

    const mappedBlogs: BlogViewModel[] =
      await this.blogsRepo.mapBlogsToResponse(blogs);
    const docCount = await this.blogsRepo.countBlogsBySearchnamePublic(
      paging.searchNameTerm,
    );
    const result = {
      pagesCount: Math.ceil(docCount / +paging.pageSize),
      page: +paging.pageNumber,
      pageSize: +paging.pageSize,
      totalCount: +docCount,
      items: mappedBlogs,
    };
    return result;
  }
}
