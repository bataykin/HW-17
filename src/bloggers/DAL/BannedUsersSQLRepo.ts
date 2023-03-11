import { Injectable } from "@nestjs/common";
import { BlogEntity } from "../entities/blogEntity";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { IBannedUsersRepo } from "./IBannedUsersRepo";
import { UserEntity } from "../../users/entity/user.entity";
import { BanUserByBlogDto } from "../dto/banUserByBlogDto";
import { BannedUsersEntity } from "../entities/bannedUsersEntity";
import { GetBannedUsersPaginationDTO } from "../dto/GetBannedUsersPaginationDTO";
import { BannedUserViewModel } from "../dto/BannedUserViewModel";

@Injectable()
export class BannedUsersSQLRepo implements IBannedUsersRepo<UserEntity> {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  setBanStatus(userId: string, dto: BanUserByBlogDto): void {
    throw new Error("Method not implemented.");
  }

  getBannedUserById(
    userId: string,
    blogId: string,
  ): Promise<BannedUsersEntity> {
    throw new Error("Method not implemented.");
  }

  async getBannedUsersForBlogPaginated(
    blogId: string,
    dto: GetBannedUsersPaginationDTO,
  ): Promise<BannedUsersEntity[]> {
    const result = await this.dataSource.query(
      `
                SELECT * 
                FROM "banned_users"
                WHERE "blogId" = $1
                AND
                
                case 
                when $4 is null then true 
                when $4 is not null then (upper("name") ~ $4)
                end 
                
                ORDER BY  "${dto.sortBy}"     ${dto.sortDirection}
                LIMIT $2 OFFSET $3;
                    `,
      [blogId, dto.pageSize, dto.skipSize, dto.searchLoginTerm],
    );
    return result;
  }

  mapBannedUserEntity(users: BannedUsersEntity) {
    throw new Error("Method not implemented.");
  }

  async mapArrayOfBannedUserEntity(
    users: BannedUsersEntity[],
    blog: BlogEntity,
  ): Promise<BannedUserViewModel[]> {
    const mappedBannedUsers = [];
    for await (const user of users) {
      mappedBannedUsers.push({
        id: user.id,
        login: user.login,
        banInfo: {
          isBanned: user.isBanned,
          banDate: user.banDate,
          banReason: user.banReason,
        },
      } as BannedUserViewModel);
      return mappedBannedUsers;
    }
  }

  async countBannedUsersBySearchLogin(searchLoginTerm: string, blogId: string) {
    const result = await this.dataSource.query(
      `
                SELECT 
                CASE
                    WHEN COUNT(*) > 0 THEN COUNT(*)
                    ELSE 0
                END AS total
                FROM "banned_users"
                WHERE "blogId" = $1
                AND
                case 
                when $2 is null then true 
                when $2 is not null then (upper("name") ~ $5)
                end 
                    `,
      [blogId, searchLoginTerm],
    );
    return result.total ?? null;
  }
}
