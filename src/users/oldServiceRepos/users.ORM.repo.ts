import { Injectable } from '@nestjs/common';
import { CreateUserPaginatedDto } from '../dto/create.user.paginated.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entity/user.entity';
import { addDays } from 'date-fns';

@Injectable()
export class UsersORMRepo {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async checkLoginEmailExists(
    login: string,
    email: string,
  ): Promise<string> | null {
    const isLoginExists = await this.usersRepository.findOneBy({
      login: login,
    });
    const isEmailExists = await this.usersRepository.findOneBy({
      email: email,
    });
    if (isLoginExists) return 'login already exists';
    if (isEmailExists) return 'email already exists';
  }

  async createUser(login: string, email: string, passwordHash: any, code: any) {
    const user = await this.usersRepository.create({
      login: login,
      email: email,
      passwordHash: passwordHash,
      confirmationCode: code,
      codeExpDate: addDays(new Date(), 1),
      isConfirmed: false,
    });

    const newUSer = await this.usersRepository.save(user);
    return newUSer;
  }

  async confirmEmail(code: any) {
    // const confirm = await this.dataSource.query(
    //     `
    //     UPDATE users
    //     SET "isConfirmed" = TRUE
    //     WHERE "confirmationCode" = $1
    //     RETURNING *
    //     `, [code])
    const confirm = await this.usersRepository.update(
      { confirmationCode: code },
      { isConfirmed: true },
    );

    return confirm;
  }

  async findById(id: string) {
    // const user = await this.dataSource.query(`
    //     SELECT id, email, login
    //         FROM users
    //         WHERE id = $1
    //         `, [id])
    const user = await this.usersRepository.findOneBy({ id });
    // console.log(user)
    return user;
  }

  async getAll({ pageNumber = 1, pageSize = 10 }: CreateUserPaginatedDto) {
    const skipSize = pageNumber > 1 ? pageSize * (pageNumber - 1) : 0;
    // const users = await this.dataSource.query(`
    //     SELECT *
    //     FROM USERS
    //     ORDER BY id
    //     LIMIT $1 OFFSET $2
    // `, [PageSize, skipSize])
    const users = await this.usersRepository
      .createQueryBuilder('users')
      .skip(skipSize)
      .take(pageSize)
      .orderBy('users.id')
      .getMany();

    const docCount = await this.countDocuments();
    return {
      pagesCount: Math.ceil(docCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: docCount,
      items: users,
    };
  }

  private async countDocuments() {
    return this.usersRepository.count();
  }

  async delete(id: number) {
    // const result = await this.dataSource.query(`
    //         DELETE FROM users
    //         WHERE id = $1
    //             `, [id])
    return await this.usersRepository.delete(id);
  }

  async checkCodeExists(code: string) {
    const isExists = await this.usersRepository.findOneBy({
      confirmationCode: code,
    });
    if (!isExists) {
      return false;
    } else {
      return isExists;
    }
  }

  async findByEmail(email: string) {
    const user = await this.usersRepository.findOneBy({ email: email });
    if (!user) {
      return false;
    } else {
      return user;
    }
  }

  async updateConfirmationCode(email: string, code: any) {
    // const confirm = await this.dataSource.query(
    //     `
    //     UPDATE users
    //     SET "confirmationCode" = $1,
    //     "expirationDate" = $2
    //     WHERE email = $3
    //     RETURNING *
    //     `, [code, addDays(new Date(), 1), email])
    //
    // //TODO Add login attempt
    const confirm = await this.usersRepository.update(
      { email: email },
      { confirmationCode: code },
    );

    return confirm;
  }

  async findByLogin(username: string) {
    const user = await this.usersRepository.findOneBy({ login: username });
    if (!user) {
      return false;
    } else {
      return user;
    }
  }

  async getUsersReactionOnComment(commentId: string, userId: any) {}
}
