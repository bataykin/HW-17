import { Injectable } from "@nestjs/common";
import { BlogEntity } from "../entities/blogEntity";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { IBannedUsersRepo } from "./IBannedUsersRepo";
import { BanUserByBlogDto } from "../dto/banUserByBlogDto";
import { BannedUsersEntity } from "../entities/bannedUsersEntity";
import { GetBannedUsersPaginationDTO } from "../dto/GetBannedUsersPaginationDTO";
import { BannedUserViewModel } from "../dto/BannedUserViewModel";

@Injectable()
export class BannedUsersSQLRepo implements IBannedUsersRepo<BannedUsersEntity> {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async setBanStatus(
    userId: string,
    dto: BanUserByBlogDto & { banDate: Date },
  ): Promise<void> {
    const isExisted = await this.dataSource.query(
      `
               SELECT * FROM "banned_users"
                WHERE "blogId" = $1 AND "userId" = $2

                    `,
      [dto.blogId, userId],
    );
    if (isExisted[0]) {
      const updBanUser = await this.dataSource.query(
        `
               UPDATE "banned_users"
               SET "isBanned" = $3, "banReason" = $4, "banDate" = $5
                WHERE "blogId" = $1 AND "userId" = $2
                    `,
        [dto.blogId, userId, dto.isBanned, dto.banReason, dto.banDate],
      );
    } else {
      const bannedLogin = await this.dataSource.query(
        `
        SELECT login FROM users
        WHERE id = $1
        `,
        [userId],
      );
      const insBanUser = await this.dataSource.query(
        `
               INSERT INTO "banned_users"
               ("userId", "login", "blogId", "isBanned", "banReason", "banDate")
               VALUES( $1, $2, $3, $4, $5, $6)
                    `,
        [
          userId,
          bannedLogin[0].login,
          dto.blogId,
          dto.isBanned,
          dto.banReason,
          dto.banDate,
        ],
      );
    }
    return;
  }

  async getBannedUserById(
    userId: string,
    blogId: string,
  ): Promise<BannedUsersEntity> {
    const res = await this.dataSource.query(
      `
      SELECT * FROM "banned_users"
      WHERE "blogId" = $1 AND "userId" = $2 
      `,
      [blogId, userId],
    );
    return res[0] ?? res;
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
                when $4::text is null then true 
                when $4::text is not null then (upper("login") ~ $4::text)
                end 
                
                ORDER BY  "${dto.sortBy}"     ${dto.sortDirection}
                LIMIT $2 OFFSET $3;
                    `,
      [blogId, dto.pageSize, dto.skipSize, dto.searchLoginTerm],
    );
    return result ?? null;
  }

  mapBannedUserEntity(users: BannedUsersEntity) {
    throw new Error("Method not implemented.");
  }

  async mapArrayOfBannedUserEntity(
    users: BannedUsersEntity[],
    blog: BlogEntity,
  ): Promise<BannedUserViewModel[]> {
    const mappedBannedUsers: BannedUserViewModel[] = [];
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
                when $2::text is null then true 
                when $2::text is not null then (upper("login") ~ $2::text)
                end 
                    `,
      [blogId, searchLoginTerm],
    );
    return result.total ?? 0;
  }
}
