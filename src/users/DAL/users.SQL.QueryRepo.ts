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
    const users = await this.dataSource.query(
      `
            SELECT * 
            FROM USERS 
            WHERE
              case
                when coalesce($4, '') = '' then true 
              else ("login" ~ $4)
                end
            AND 
              case
                 when coalesce($5, '') = '' then true 
              else ("email" ~ $5)
                 end
            AND
              case
                 when $6::boolean then true
              else ("isBanned" = $7::boolean)
                 end
            ORDER BY $3
            LIMIT $1 OFFSET $2
        `,
      [
        pageSize,
        skipSize,
        sortDirection,
        searchLoginTerm,
        searchEmailTerm,
        banStatus == "all",
        (banStatus as "banned" | "unBanned") == "banned",
      ],
    );
    return users;
  }

  async countDocuments() {
    // return this.bloggerModel.countDocuments(filter);

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

  countUsersBySearchname(
    searchLoginTerm: string,
    searchEmailTerm: string,
  ): Promise<number> {
    return Promise.resolve(0);
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
  // async findOne(userFilterQuery: FilterQuery<User>): Promise<UserDocument> | null {
  //     return this.userModel.findOne(userFilterQuery)
  // }

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
    return null;
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
    console.log(user);
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
    console.log(res);
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
