import { BlogsPaginationDto } from "../../bloggers/dto/blogsPaginationDto";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { IBlogsRepo, IBlogsRepoToken } from "../../bloggers/DAL/IBlogsRepo";
import { BlogEntity } from "../../bloggers/entities/blogEntity";
import { PaginatorModel } from "../../common/PaginatorModel";
import { SA_BlogViewModel } from "../dto/SA_BlogViewModel";

export class SA_GetBlogsQuery {
  constructor(public readonly dto: BlogsPaginationDto) {}
}

@QueryHandler(SA_GetBlogsQuery)
export class SA_GetBlogsHandler implements IQueryHandler<SA_GetBlogsQuery> {
  constructor(
    @Inject(IBlogsRepoToken)
    private readonly blogsRepo: IBlogsRepo<BlogEntity>,
  ) {}
  async execute(
    query: SA_GetBlogsQuery,
  ): Promise<PaginatorModel<SA_BlogViewModel[]>> {
    const paging = {
      searchNameTermTerm: query.dto.searchNameTerm?.toUpperCase() ?? null,
      sortBy: query.dto.sortBy ?? "createdAt",
      sortDirection: query.dto.sortDirection ?? "desc",
      pageNumber: query.dto.pageNumber ?? 1,
      pageSize: query.dto.pageSize ?? 10,
      skipSize:
        +query.dto.pageNumber > 1
          ? +query.dto.pageSize * (+query.dto.pageNumber - 1)
          : 0,
    } as BlogsPaginationDto;
    const blogs: BlogEntity[] = await this.blogsRepo.SA_GetBlogs(paging);

    const mappedBlogs: SA_BlogViewModel[] =
      await this.blogsRepo.SA_mapBlogsToResponse(blogs);
    const docCount = await this.blogsRepo.SA_countBlogsBySearchname(
      paging.searchNameTerm,
    );

    return {
      pagesCount: Math.ceil(+docCount / +paging.pageSize),
      page: +paging.pageNumber,
      pageSize: +paging.pageSize,
      totalCount: +docCount,
      items: mappedBlogs,
    };
  }
}
