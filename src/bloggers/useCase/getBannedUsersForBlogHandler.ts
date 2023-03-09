import { BlogsPaginationDto } from "../dto/blogsPaginationDto";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { AuthService } from "../../auth/authService";
import {
  ForbiddenException,
  Inject,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { UserEntity } from "../../users/entity/user.entity";
import { IBlogsRepo, IBlogsRepoToken } from "../DAL/IBlogsRepo";
import { BlogEntity } from "../entities/blogEntity";
import {
  IBannedUsersRepo,
  IBannedUsersRepoToken,
} from "../DAL/IBannedUsersRepo";
import { BannedUsersEntity } from "../entities/bannedUsersEntity";
import {
  IUsersQueryRepo,
  IUsersQueryRepoToken,
} from "../../users/DAL/IUserQueryRepo";

export class GetBannedUsersForBlogQuery {
  constructor(
    public readonly blogId: string,
    public readonly dto: BlogsPaginationDto,
    public readonly accessToken: string,
  ) {}
}

@QueryHandler(GetBannedUsersForBlogQuery)
export class GetBannedUsersForBlogHandler
  implements IQueryHandler<GetBannedUsersForBlogQuery>
{
  constructor(
    private readonly authService: AuthService,
    @Inject(IUsersQueryRepoToken)
    private readonly usersQueryRepo: IUsersQueryRepo<UserEntity>,
    @Inject(IBlogsRepoToken)
    private readonly blogsRepo: IBlogsRepo<BlogEntity>,
    @Inject(IBannedUsersRepoToken)
    private readonly bannedUsersRepo: IBannedUsersRepo<BannedUsersEntity>,
  ) {}
  async execute(query: GetBannedUsersForBlogQuery): Promise<any> {
    const { dto, blogId, accessToken } = query;
    const retrievedUserFromToken = await this.authService.retrieveUser(
      accessToken,
    );
    const userIdFromToken = retrievedUserFromToken.userId;
    const isUserExist = await this.usersQueryRepo.findById(userIdFromToken);
    if (!isUserExist) {
      throw new UnauthorizedException("unexpected user");
    }

    const blog = await this.blogsRepo.findBlogById(blogId);
    if (!blog) {
      throw new NotFoundException(`blogId ${blogId} not found`);
    }
    const blogOwnerId = blog.userId;
    if (userIdFromToken !== blogOwnerId) {
      throw new ForbiddenException(
        "try to get the entity that was created by another user",
      );
    }
    const {
      searchNameTerm = "",
      pageNumber = 1,
      pageSize = 10,
      sortBy = "createdAt",
      sortDirection = "desc",
      skipSize = +pageNumber > 1 ? +pageSize * (+pageNumber - 1) : 0,
    } = dto;
    const usersPaginationBLLdto = {
      searchNameTerm,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      skipSize,
    };
    const bannedUsers =
      await this.bannedUsersRepo.getBannedUsersForBlogPaginated(
        blogId,
        usersPaginationBLLdto,
      );
    const mappedUsers = await this.bannedUsersRepo.mapArrayOfBannedUserEntity(
      bannedUsers,
    );

    const docCount = await this.bannedUsersRepo.countBannedUsersBySearchName(
      usersPaginationBLLdto.searchNameTerm,
    );
    return {
      pagesCount: Math.ceil(docCount / pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: docCount,
      items: mappedUsers,
    };
  }
}
