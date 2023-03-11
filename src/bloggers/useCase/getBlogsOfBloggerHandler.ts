import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { BlogsPaginationDto } from "../dto/blogsPaginationDto";
import { Inject, UnauthorizedException } from "@nestjs/common";
import { IBlogsRepo, IBlogsRepoToken } from "../DAL/IBlogsRepo";
import { BlogEntity } from "../entities/blogEntity";
import { AuthService } from "../../auth/authService";
import { UserEntity } from "../../users/entity/user.entity";
import {
  IUsersQueryRepo,
  IUsersQueryRepoToken,
} from "../../users/DAL/IUserQueryRepo";
import { PaginatorModel } from "../../common/PaginatorModel";
import { BlogViewModel } from "../dto/BlogViewModel";

export class GetBlogsOfBloggerQuery {
  constructor(
    public readonly dto: BlogsPaginationDto,
    public readonly accessToken: string,
  ) {}
}

@QueryHandler(GetBlogsOfBloggerQuery)
export class GetBlogsOfBloggerHandler
  implements IQueryHandler<GetBlogsOfBloggerQuery>
{
  constructor(
    @Inject(IBlogsRepoToken)
    private readonly blogsRepo: IBlogsRepo<BlogEntity>,
    private readonly authService: AuthService,
    @Inject(IUsersQueryRepoToken)
    private readonly usersQueryRepo: IUsersQueryRepo<UserEntity>,
  ) {}

  async execute(
    query: GetBlogsOfBloggerQuery,
  ): Promise<PaginatorModel<BlogViewModel[]>> {
    const { dto, accessToken } = query;
    const retrievedUserFromToken = await this.authService.retrieveUser(
      accessToken,
    );
    const userIdFromToken = retrievedUserFromToken.userId;
    const isUserExist = await this.usersQueryRepo.findById(userIdFromToken);
    if (!isUserExist || isUserExist.isBanned) {
      throw new UnauthorizedException("unexpected user");
    }
    const paging = {
      searchNameTerm: dto.searchNameTerm?.toUpperCase() ?? null,
      sortBy: dto.sortBy ?? "createdAt",
      sortDirection: dto.sortDirection ?? "desc",
      pageNumber: dto.pageNumber ?? 1,
      pageSize: dto.pageSize ?? 10,
      skipSize: dto.pageNumber > 1 ? dto.pageSize * (dto.pageNumber - 1) : 0,
    } as BlogsPaginationDto;
    const blogs: BlogEntity[] = await this.blogsRepo.getBlogsOfBloggerPaginated(
      paging,
      userIdFromToken,
    );
    const mappedBlogs = await this.blogsRepo.mapBlogsToResponse(blogs);
    const docCount = await this.blogsRepo.countBloggersBlogsBySearchname(
      paging.searchNameTerm,
      userIdFromToken,
    );
    const result: PaginatorModel<BlogViewModel[]> = {
      pagesCount: Math.ceil(docCount / +paging.pageSize),
      page: +paging.pageNumber,
      pageSize: +paging.pageSize,
      totalCount: docCount,
      items: mappedBlogs,
    };
    return result;
  }
}
