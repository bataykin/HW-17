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
    //TODO repair sorting
    const users = await this.dataSource.query(
      `
            SELECT * 
            FROM USERS 
            WHERE
              case
                when coalesce($1, '') = '' then true 
              else ("login" ~ $1)
                end
            AND 
              case
                 when coalesce($2, '') = '' then true 
              else ("email" ~ $2)
                 end
            AND
              case
                 when $3::boolean then true
              else ("isBanned" = $4::boolean)
                 end
                 
            ORDER BY 
             (CASE 
             WHEN $8 = 'ASC' THEN $7 END) COLLATE "C" ASC,
             $7 COLLATE "C" DESC
            
             LIMIT $5 OFFSET $6;
        `,
      [
        searchLoginTerm,
        searchEmailTerm,
        banStatus == "all",
        (banStatus as "banned" | "unBanned") == "banned",
        pageSize,
        skipSize,
        sortBy,
        sortDirection == "desc" ? "DESC" : "ASC",
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
                when coalesce($1, '') = '' then true 
              else ("login" ~ $1)
                end
            AND 
              case
                 when coalesce($2, '') = '' then true 
              else ("email" ~ $2)
                 end
            AND
              case
                 when $3::boolean then true
              else ("isBanned" = $4::boolean)
                 end
                `,
      [
        searchLoginTerm,
        searchEmailTerm,
        banStatus == "all",
        (banStatus as "banned" | "unBanned") == "banned",
      ],
    );
    return user;
  }

  async findByEmail(email: string) {
    const user = await this.dataSource.query(
      `
            SELECT email
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
            SELECT id, login, "passwordHash"
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
