import { BanUserByBlogDto } from "../dto/banUserByBlogDto";
import { BannedUsersEntity } from "../entities/bannedUsersEntity";
import { CreateUserPaginatedDto } from "../../users/dto/create.user.paginated.dto";
import { BlogEntity } from "../entities/blogEntity";

export const IBannedUsersRepoToken = Symbol("IBannedUsersRepoToken");

export interface IBannedUsersRepo<GenericBannedUserType> {
  setBanStatus(userId: string, dto: BanUserByBlogDto): void;

  getBannedUserById(
    userId: string,
    blogId: string,
  ): Promise<BannedUsersEntity | null>;

  getBannedUsersForBlogPaginated(
    blogId: string,
    dto: CreateUserPaginatedDto,
  ): Promise<BannedUsersEntity[] | null>;

  mapBannedUserEntity(users: BannedUsersEntity): any;

  mapArrayOfBannedUserEntity(
    users: BannedUsersEntity[],
    blog: BlogEntity,
  ): Promise<any>;

  countBannedUsersBySearchLogin(
    searchLoginTerm: string,
    blogId: string,
  ): Promise<number | null>;
}
