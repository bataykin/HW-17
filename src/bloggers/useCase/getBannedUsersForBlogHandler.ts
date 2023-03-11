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
import { GetBannedUsersPaginationDTO } from "../dto/GetBannedUsersPaginationDTO";
import { PaginatorModel } from "../../common/PaginatorModel";
import { BannedUserViewModel } from "../dto/BannedUserViewModel";

export class GetBannedUsersForBlogQuery {
  constructor(
    public readonly blogId: string,
    public readonly dto: GetBannedUsersPaginationDTO,
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
  async execute(
    query: GetBannedUsersForBlogQuery,
  ): Promise<PaginatorModel<BannedUserViewModel[]>> {
    const { dto, blogId, accessToken } = query;
    const retrievedUserFromToken = await this.authService.retrieveUser(
      accessToken,
    );
    const userIdFromToken = retrievedUserFromToken.userId;
    const isUserExist = await this.usersQueryRepo.findById(userIdFromToken);
    if (!isUserExist || isUserExist.isBanned) {
      throw new UnauthorizedException("unexpected user");
    }
    const blog = await this.blogsRepo.findBlogById(blogId);
    if (!blog) {
      throw new NotFoundException("net takogo blogId");
    }
    if (blog?.userId !== userIdFromToken) {
      throw new ForbiddenException(
        "user try to update blog that doesn't belong to current user",
      );
    }
    const paging = {
      searchLoginTerm: dto.searchLoginTerm?.toUpperCase() ?? null,
      sortBy: dto.sortBy ?? "createdAt",
      sortDirection: dto.sortDirection ?? "desc",
      pageNumber: dto.pageNumber ?? 1,
      pageSize: dto.pageSize ?? 10,
      skipSize: dto.pageNumber > 1 ? dto.pageSize * (dto.pageNumber - 1) : 0,
      id: dto.id ?? blogId,
    } as GetBannedUsersPaginationDTO;

    const bannedUsers: BannedUsersEntity[] =
      await this.bannedUsersRepo.getBannedUsersForBlogPaginated(blogId, paging);

    const mappedUsers: BannedUserViewModel[] =
      await this.bannedUsersRepo.mapArrayOfBannedUserEntity(bannedUsers, blog);

    const docCount = await this.bannedUsersRepo.countBannedUsersBySearchLogin(
      paging.searchLoginTerm,
      blogId,
    );
    return {
      pagesCount: Math.ceil(docCount / +paging.pageSize),
      page: +paging.pageNumber,
      pageSize: +paging.pageSize,
      totalCount: docCount,
      items: mappedUsers,
    };
  }
}
