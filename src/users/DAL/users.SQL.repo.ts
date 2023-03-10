import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { AuthHashClass } from "../../auth/auth.utils";

import { addDays } from "date-fns";
import { IUsersRepo } from "./IUsersRepo";
import { UserEntity } from "../entity/user.entity";
import { BanUserInputModel } from "../../superadmin/dto/BanUserInputModel";

@Injectable()
export class UsersSQLRepo implements IUsersRepo<UserEntity> {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    protected readonly authUtils: AuthHashClass,
  ) {}

  async createUser(
    login: string,
    email: string,
    passwordHash: string,
    code: string,
  ) {
    const result = await this.dataSource.query(
      `
                INSERT INTO users (login, email,  "passwordHash", "confirmationCode", "codeExpDate")
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id
                    `,
      [login, email, passwordHash, code, addDays(new Date(), 1)],
    );
    return result;
  }

  async confirmEmail(code: string) {
    const confirm = await this.dataSource.query(
      `
            UPDATE users
            SET "isConfirmed" = TRUE
            WHERE "confirmationCode" = $1
            RETURNING *
            `,
      [code],
    );
    return confirm;
  }

  async deleteUser(id: string) {
    const result = await this.dataSource.query(
      `
                DELETE FROM users
                WHERE id = $1
                    `,
      [id],
    );
    return result;
  }

  async updateConfirmationCode(email: string, code: any) {
    const confirm = await this.dataSource.query(
      `
            UPDATE users
            SET "confirmationCode" = $1,
            "codeExpDate" = $2
            WHERE email = $3
            RETURNING *
            `,
      [code, addDays(new Date(), 1), email],
    );
    return confirm;
  }

  async addPasswordRecoveryCode(email: string, passRecoveryCode: string) {}

  async renewPassword(recoveryCode: string, passwordHash: string) {}

  async checkPassRecoveryCodeIsValid(recoveryCode: string) {}

  async setBanStatus(userId: string, dto: BanUserInputModel) {
    const result = await this.dataSource.query(
      `
                UPDATE USERS
                SET "isBanned" = $1, "banReason" = $2, "banDate" = $3
                WHERE id = $4
                    `,
      [dto.isBanned, dto.banReason, new Date(), userId],
    );
    return result;
  }
}
