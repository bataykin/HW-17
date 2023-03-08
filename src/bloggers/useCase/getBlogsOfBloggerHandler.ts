import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { BlogsPaginationDto } from "../dto/blogsPaginationDto";
import { Inject, UnauthorizedException } from "@nestjs/common";
import { IBlogsRepo, IBlogsRepoToken } from "../IBlogsRepo";
import { BlogEntity } from "../entities/blogEntity";
import { AuthService } from "../../auth/authService";
import { IUsersRepo, IUsersRepoToken } from "../../users/IUsersRepo";
import { UserEntity } from "../../users/entity/user.entity";

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
    @Inject(IUsersRepoToken)
    private readonly usersRepo: IUsersRepo<UserEntity>,
  ) {}

  async execute(query: GetBlogsOfBloggerQuery): Promise<any> {
    const { dto, accessToken } = query;
    const retrievedUserFromToken = await this.authService.retrieveUser(
      accessToken,
    );
    const userIdFromToken = retrievedUserFromToken.userId;
    const isUserExist = await this.usersRepo.findById(userIdFromToken);
    if (!isUserExist) {
      throw new UnauthorizedException('unexpected user');
    }
    const {
      searchNameTerm = '',
      pageNumber = 1,
      pageSize = 10,
      sortBy = 'createdAt',
      sortDirection = 'desc',
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

    const blogs = await this.blogsRepo.getBlogsPaginated(
      blogsPaginationBLLdto,
      userIdFromToken,
    );
    // const blogs = await this.blogsRepo.getBlogsPaginated(blogsPaginationBLLdto)
    // const mappedBlogs = await this.blogsRepo.mapBlogsWithOwnersToResponse(blogs)
    const mappedBlogs = await this.blogsRepo.mapBlogsToResponse(
      blogs,
      'id',
      'name',
      'description',
      'websiteUrl',
      'isMembership',
      'createdAt',
    );
    const docCount = await this.blogsRepo.countUsersBlogsBySearchname(
      searchNameTerm,
      userIdFromToken,
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
