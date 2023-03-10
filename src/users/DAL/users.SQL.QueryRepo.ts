import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { UserEntity } from "../entity/user.entity";
import { IUsersQueryRepo } from "./IUserQueryRepo";
import { SA_UserViewModel } from "../../superadmin/dto/SA_UserViewModel";
import { SAGetUsersPaginationModel } from "../../superadmin/dto/SAGetUsersPaginationModel";

@Injectable()
export class UsersSQLQueryRepo implements IUsersQueryRepo<UserEntity> {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findById(id: string) {
    const user = await this.dataSource.query(
      `
            SELECT *
                FROM users
                WHERE id = $1
                `,
      [id],
    );
    return user;
  }

  async SA_GetUsers(dto: SAGetUsersPaginationModel) {
    const {
      pageNumber,
      pageSize,
      skipSize,
      searchEmailTerm,
      searchLoginTerm,
      sortDirection,
      sortBy,
      banStatus,
    } = dto;
    let clarifiedBanStatus = banStatus == "all" ? null : banStatus == "banned";

    const users = await this.dataSource.query(
      `
            SELECT * 
            FROM USERS 
            WHERE 
            
            case 
            when $3::boolean is null then true
            else "isBanned" = ${clarifiedBanStatus}
            end
            
            AND
            
            case 
            when ($4::text is null and $5::text is null) then true
            when ($4::text is not  null and $5::text is not null)
                then (upper("login") ~ $4 OR upper("email") ~ $5 )
            when ($4::text is not  null and $5::text is null)
                then (upper("login") ~ $4  )
            when ($4::text is   null and $5::text is not null)
                then ( upper("email") ~ $5 )
            end
             
            ORDER BY  
             "${sortBy}" ${sortDirection}
             LIMIT $1 OFFSET $2;
        `,

      [
        pageSize,
        skipSize,
        clarifiedBanStatus,
        searchLoginTerm,
        searchEmailTerm,
      ],
    );
    return users;
  }

  async countDocuments() {
    const result = await this.dataSource.query(
      `
                SELECT 
                CASE
                    WHEN COUNT(*) > 0 THEN COUNT(*)
                    ELSE 0
                END AS total
                FROM users
                    `,
      [],
    );
    return result;
  }

  async SA_CountUsersBySearch(
    searchLoginTerm: string,
    searchEmailTerm: string,
    banStatus: string,
  ): Promise<number> {
    let clarifiedBanStatus = banStatus == "all" ? null : banStatus == "banned";

    const user = await this.dataSource.query(
      `
              SELECT 
                CASE
                    WHEN COUNT(*) > 0 THEN COUNT(*)
                    ELSE 0
                END AS total
                FROM users
                WHERE
            case 
            when $3::boolean is null then true
            else "isBanned" = ${clarifiedBanStatus}
            end
            
            AND
            
            case 
            when ($1::text is null and $2::text is null) then true
            when ($1::text is not  null and $2::text is not null)
                then (upper("login") ~ $1 OR upper("email") ~ $2 )
            when ($1::text is not  null and $2::text is null)
                then (upper("login") ~ $1  )
            when ($1::text is   null and $2::text is not null)
                then ( upper("email") ~ $2 )
            end
                `,
      [searchLoginTerm, searchEmailTerm, clarifiedBanStatus],
    );
    return user;
  }

  async findByEmail(email: string) {
    const user = await this.dataSource.query(
      `
            SELECT *
                FROM users
                WHERE email = $1
                `,
      [email],
    );
    if (user.length == 0) {
      return false;
    } else {
      return user;
    }
  }

  async findByLogin(login: string) {
    const user = await this.dataSource.query(
      `
            SELECT *
                FROM users
                WHERE login = $1
                `,
      [login],
    );
    if (user.length == 0) {
      return false;
    } else {
      return user;
    }
  }

  async checkLoginEmailExists(
    login: string,
    email: string,
  ): Promise<string> | null {
    const isLoginExists = await this.dataSource.query(
      `
                SELECT login
                FROM users
                WHERE login = $1
                `,
      [login],
    );
    const isEmailExists = await this.dataSource.query(
      `
                SELECT email
                FROM users
                WHERE email = $1
                `,
      [email],
    );
    if (isLoginExists.length > 0) return "login already exists";
    if (isEmailExists.length > 0) return "email already exists";
  }

  async checkCodeExists(code: string) {
    const isExists = await this.dataSource.query(
      `
         SELECT "isConfirmed"
                FROM users
                WHERE "confirmationCode" = $1
                `,
      [code],
    );
    if (isExists.length == 0) {
      return false;
    } else {
      return isExists;
    }
  }

  async getBanStatus(userId: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  async SA_mapUserEntityToResponse(
    user: UserEntity,
  ): Promise<SA_UserViewModel> {
    const res: SA_UserViewModel = {
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
      banInfo: {
        isBanned: user.isBanned,
        banDate: user.banDate,
        banReason: user.banReason,
      },
    };
    return res;
  }

  async SA_mapUserEntitiesToResponse(
    users: UserEntity[],
  ): Promise<SA_UserViewModel[]> {
    const mappedUsers = [];
    for await (const user of users) {
      mappedUsers.push({
        id: user.id,
        login: user.login,
        email: user.email,
        createdAt: user.createdAt,
        banInfo: {
          isBanned: user.isBanned,
          banDate: user.banDate,
          banReason: user.banReason,
        },
      });
    }

    return mappedUsers;
  }
}
