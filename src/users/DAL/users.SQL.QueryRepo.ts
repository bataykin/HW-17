import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { CreateUserPaginatedDto } from "../dto/create.user.paginated.dto";
import { UserEntity } from "../entity/user.entity";
import { IUsersQueryRepo } from "./IUserQueryRepo";
import { SAUserViewModel } from "../../superadmin/dto/SAUserViewModel";

@Injectable()
export class UsersSQLQueryRepo implements IUsersQueryRepo<UserEntity> {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}
  async findById(id: string) {
    const user = await this.dataSource.query(
      `
            SELECT id, email, login
                FROM users
                WHERE id = $1
                `,
      [id],
    );
    return user;
  }

  async getUsers({ pageNumber = 1, pageSize = 10 }: CreateUserPaginatedDto) {
    const skipSize = pageNumber > 1 ? pageSize * (pageNumber - 1) : 0;
    const users = await this.dataSource.query(
      `
            SELECT * 
            FROM USERS
            ORDER BY id
            LIMIT $1 OFFSET $2
        `,
      [pageSize, skipSize],
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

  async mapUserEntityToResponse(user: UserEntity): Promise<SAUserViewModel> {
    return Promise.resolve(undefined);
  }
}
