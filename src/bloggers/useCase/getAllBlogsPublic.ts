import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { BlogsPaginationDto } from "../dto/blogsPaginationDto";
import { Inject } from "@nestjs/common";
import { IBlogsRepo, IBlogsRepoToken } from "../DAL/IBlogsRepo";
import { BlogEntity } from "../entities/blogEntity";
import { AuthService } from "../../auth/authService";
import { IUsersRepo, IUsersRepoToken } from "../../users/DAL/IUsersRepo";
import { UserEntity } from "../../users/entity/user.entity";

export class GetAllBlogsQuery {
  constructor(public readonly dto: BlogsPaginationDto) {}
}

@QueryHandler(GetAllBlogsQuery)
export class GetAllBlogsHandler implements IQueryHandler<GetAllBlogsQuery> {
  constructor(
    @Inject(IBlogsRepoToken)
    private readonly blogsRepo: IBlogsRepo<BlogEntity>,
    private readonly authService: AuthService,
    @Inject(IUsersRepoToken)
    private readonly usersRepo: IUsersRepo<UserEntity>,
  ) {}

  async execute(query: GetAllBlogsQuery): Promise<any> {
    const { dto } = query;
    const {
      searchNameTerm = "",
      pageNumber = 1,
      pageSize = 10,
      sortBy = "createdAt",
      sortDirection = "desc",
      skipSize = +pageNumber > 1 ? +pageSize * (+pageNumber - 1) : 0,
    } = dto;
    const blogsPaginationBLLdto = {
      searchNameTerm,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      skipSize,
    };

    const blogs = await this.blogsRepo.getBlogsPaginated(blogsPaginationBLLdto);
    // const blogs = await this.blogsRepo.getBlogsPaginated(blogsPaginationBLLdto)
    // const mappedBlogs = await this.blogsRepo.mapBlogsWithOwnersToResponse(blogs)
    const mappedBlogs = await this.blogsRepo.mapBlogsToResponse(
      blogs,
      "id",
      "name",
      "description",
      "websiteUrl",
      "isMembership",
      "createdAt",
    );
    const docCount = await this.blogsRepo.countBlogsBySearchname(
      searchNameTerm,
    );
    const result = {
      pagesCount: Math.ceil(docCount / +pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: docCount,
      items: mappedBlogs,
    };
    return result;
  }
}
