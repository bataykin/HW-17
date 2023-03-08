import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { IUsersRepo } from './IUsersRepo';
import { CreateUserPaginatedDto } from './dto/create.user.paginated.dto';
import { addDays } from 'date-fns';
import { BanUnbanUserDto } from './dto/BanUnbanUserDto';

export class UsersORM
  extends Repository<UserEntity>
  implements IUsersRepo<UserEntity>
{
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
  ) {
    super(UserEntity, usersRepo.manager, usersRepo.queryRunner);
  }

  async renewPassword(recoveryCode: string, passwordHash: string) {
    return await this.usersRepo.update(
      { passwordRecoveryCode: recoveryCode },
      { passwordHash: passwordHash },
    );
  }

  async addPasswordRecoveryCode(email: string, passRecoveryCode: string) {
    return await this.usersRepo.update(
      { email: email },
      { passwordRecoveryCode: passRecoveryCode },
    );
  }

  async checkCodeExists(code: string): Promise<UserEntity | null> {
    const isExists = await this.usersRepo.findOneBy({ confirmationCode: code });
    if (!isExists) {
      return null;
    } else {
      return isExists;
    }
  }

  async checkLoginEmailExists(
    login: string,
    email: string,
  ): Promise<string | null> {
    const isLoginExists = await this.usersRepo.findOneBy({ login: login });
    const isEmailExists = await this.usersRepo.findOneBy({ email: email });
    if (isLoginExists) return 'login already exists';
    if (isEmailExists) return 'email already exists';
    return null;
  }

  async confirmEmail(code: string) {
    const confirm = await this.usersRepo.update(
      { confirmationCode: code },
      { isConfirmed: true },
    );

    return confirm;
  }

  async countDocuments(): Promise<number> {
    return this.usersRepo.count();
  }

  async createUser(
    login: string,
    email: string,
    passwordHash: string,
    code: string,
  ): Promise<UserEntity> {
    const user = await this.usersRepo.create({
      login: login,
      email: email,
      passwordHash: passwordHash,
      confirmationCode: code,
      codeExpDate: addDays(new Date(), 1),
      isConfirmed: false,
    });
    const newUser = await this.usersRepo.save(user);
    return newUser;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.usersRepo.findOneBy({ email: email });
    if (!user) {
      return null;
    } else {
      return user;
    }
  }

  async findById(id: string): Promise<UserEntity | null> {
    return await this.usersRepo.findOneBy({ id });
  }

  async findByLoginOrEmail(username: string): Promise<UserEntity | null> {
    const user = await this.usersRepo.findOneBy([
      { login: username },
      { email: username },
    ]);
    if (!user) {
      return null;
    } else {
      return user;
    }
  }

  async getUsersPaginated(dto: CreateUserPaginatedDto): Promise<UserEntity[]> {
    if (dto.sortBy === 'createdAt') {
      const users = await this.usersRepo
        .createQueryBuilder('users')
        .where('LOWER(users.login) like LOWER(:login)', {
          login: `%${dto.searchLoginTerm}%`,
        })
        .orWhere('LOWER(users.email) like LOWER(:email)', {
          email: `%${dto.searchEmailTerm}%`,
        })
        .skip(dto.skipSize)
        .take(dto.pageSize)
        .orderBy(
          //     `CASE
          // WHEN "${dto.sortBy}" = "createdAt"
          // THEN "users." || "${dto.sortBy}" || "::bytea"
          // ELSE "users." || "${dto.sortBy}"
          // `
          'users.' + dto.sortBy,
          // + ' COLLATE "C"'
          /*+ '::bytea'*/
          dto.sortDirection === 'asc' ? 'ASC' : 'DESC',
          'NULLS LAST',
        )
        .getMany();

      return users;
    }
    const users = await this.usersRepo
      .createQueryBuilder('users')
      .where('LOWER(users.login) like LOWER(:login)', {
        login: `%${dto.searchLoginTerm}%`,
      })
      .orWhere('LOWER(users.email) like LOWER(:email)', {
        email: `%${dto.searchEmailTerm}%`,
      })
      .skip(dto.skipSize)
      .take(dto.pageSize)
      .orderBy(
        //     `CASE
        // WHEN "${dto.sortBy}" = "createdAt"
        // THEN "users." || "${dto.sortBy}" || "::bytea"
        // ELSE "users." || "${dto.sortBy}"
        // `
        'users.' + dto.sortBy + ' COLLATE "C"',
        /*+ '::bytea'*/
        dto.sortDirection === 'asc' ? 'ASC' : 'DESC',
        'NULLS LAST',
      )
      .getMany();
    return users;
  }

  async updateConfirmationCode(email: string, code: string) {
    const confirm = await this.usersRepo.update(
      { email: email },
      { confirmationCode: code },
    );

    return confirm;
  }

  async deleteUser(id: string) {
    return await this.usersRepo.delete(id);
  }

  async checkPassRecoveryCodeIsValid(recoveryCode: string) {
    const isExists = await this.usersRepo.findOneBy({
      passwordRecoveryCode: recoveryCode,
    });
    if (!isExists) {
      return null;
    } else {
      return isExists;
    }
  }

  async countUsersBySearchname(
    searchNameTerm: string,
    searchEmailTerm: string,
  ) {
    const res = await this.usersRepo
      .createQueryBuilder('u')
      .where('LOWER(u.login) like LOWER(:login)', {
        login: `%${searchNameTerm}%`,
      })
      .orWhere('LOWER(u.email) like LOWER(:email)', {
        email: `%${searchEmailTerm}%`,
      })
      .getCount();
    return res;
  }

  async setBanStatus(userId: string, dto: BanUnbanUserDto) {
    if (dto.isBanned) {
      const res = await this.usersRepo.update(
        { id: userId },
        {
          isBanned: dto.isBanned,
          banReason: dto.banReason,
          banDate: new Date(),
        },
      );
      return res;
    } else {
      const res = await this.usersRepo.update(
        { id: userId },
        { isBanned: dto.isBanned, banReason: null, banDate: null },
      );
      return res;
    }
  }

  async mapUserEntityToResponse(user: UserEntity) {
    const result = {
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
    return result;
  }

  async mapArrayOfUserEntitiesToResponse(users: UserEntity[]) {
    const mappedUsers = [];
    for await (const user of users) {
      mappedUsers.push(await this.mapUserEntityToResponse(user));
    }
    return mappedUsers;
  }

  async getBanStatus(userId: string): Promise<boolean> {
    const user = await this.usersRepo.findOneBy({ id: userId });
    return user.isBanned;
  }
}
