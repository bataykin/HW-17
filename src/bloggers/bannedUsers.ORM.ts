import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { BannedUsersEntity } from "./entities/bannedUsersEntity";
import { IBannedUsersRepo } from "./DAL/IBannedUsersRepo";
import { BanUserByBlogDto } from "./dto/banUserByBlogDto";
import { UserEntity } from "../users/entity/user.entity";

export class BannedUsersORM
  extends Repository<BannedUsersEntity>
  implements IBannedUsersRepo<BannedUsersEntity>
{
  constructor(
    @InjectRepository(BannedUsersEntity)
    private readonly bannedUsersRepo: Repository<BannedUsersEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
  ) {
    super(
      BannedUsersEntity,
      bannedUsersRepo.manager,
      bannedUsersRepo.queryRunner,
    );
  }

  async setBanStatus(userId: string, dto: BanUserByBlogDto): Promise<void> {
    // const userLogin = await this.bannedUsersRepo
    //   .createQueryBuilder('bannedUser')
    //   .innerJoinAndSelect('bannedUser.user', 'users')
    //   .where('users.id = :userId', { userId })
    //   .getOne();

    // const userLogin = await this.bannedUsersRepo
    //   .createQueryBuilder('bannedUser')
    //   .innerJoinAndSelect('bannedUser.user', 'users')
    //   .where('users.id = :userId', { userId: bannedUser.userId })
    //   .getOne();

    const user = await this.usersRepo.findOneBy({ id: userId });
    const bannedUser = {
      userId: userId,
      blogId: dto.blogId,
      login: user.login,
      isBanned: dto.isBanned,
      banReason: dto.isBanned ? dto.banReason : null,
      banDate: dto.isBanned ? new Date() : null,
    };
    const wasBannedInThisBlog = await this.getBannedUserById(
      userId,
      dto.blogId,
    );
    if (!wasBannedInThisBlog && dto.isBanned) {
      const res = await this.bannedUsersRepo.insert(bannedUser);
      return;
    } else {
      if (dto.isBanned == true) {
        const res = await this.bannedUsersRepo.update(
          { userId: userId, blogId: dto.blogId },
          {
            banReason: dto.banReason,
            banDate: new Date(),
          },
        );
        return;
      } else {
        await this.bannedUsersRepo.delete({
          userId: userId,
          blogId: dto.blogId,
        });
      }
    }
  }

  async getBannedUserById(
    userId: string,
    blogId: string,
  ): Promise<BannedUsersEntity | null> {
    return await this.bannedUsersRepo.findOneBy({ userId, blogId });
  }

  async getBannedUsersForBlogPaginated(
    blogId: string,
    dto: any,
  ): Promise<BannedUsersEntity[] | null> {
    // return await this.bannedUsersRepo.findBy({ blogId: blogId });

    if (dto.sortBy === `createdAt`) {
      const users = await this.bannedUsersRepo
        .createQueryBuilder("users")
        .where(`LOWER(users.login) like LOWER(:login)`, {
          login: `%${dto.searchNameTerm}%`,
        })
        .andWhere(`users.blogId =:blogId`, { blogId })
        .skip(dto.skipSize)
        .take(dto.pageSize)
        .orderBy(
          //     `CASE
          // WHEN "${dto.sortBy}" = "createdAt"
          // THEN "users." || "${dto.sortBy}" || "::bytea"
          // ELSE "users." || "${dto.sortBy}"
          // `
          "users.banDate" /*+ dto.sortBy*/,
          // + ' COLLATE "C"'
          /*+ '::bytea'*/
          dto.sortDirection === `asc` ? `ASC` : `DESC`,
          `NULLS LAST`,
        )
        .getMany();

      return users;
    }
    const users = await this.bannedUsersRepo
      .createQueryBuilder("users")
      .where(`LOWER(users.login) like LOWER(:login)`, {
        login: `%${dto.searchNameTerm}%`,
      })
      .andWhere(`users.blogId =:blogId`, { blogId })
      .skip(dto.skipSize)
      .take(dto.pageSize)
      .orderBy(
        //     `CASE
        // WHEN "${dto.sortBy}" = "createdAt"
        // THEN "users." || "${dto.sortBy}" || "::bytea"
        // ELSE "users." || "${dto.sortBy}"
        // `
        "users." + dto.sortBy + ` COLLATE "C"`,
        /*+ '::bytea'*/
        dto.sortDirection === `asc` ? `ASC` : `DESC`,
        `NULLS LAST`,
      )
      .getMany();
    return users;
  }

  async mapBannedUserEntity(bannedUser: BannedUsersEntity): Promise<any> {
    const result = {
      id: bannedUser.userId,
      login: bannedUser.login,
      banInfo: {
        isBanned: bannedUser.isBanned,
        banDate: bannedUser.banDate,
        banReason: bannedUser.banReason,
      },
    };
    return result;
  }

  async mapArrayOfBannedUserEntity(users: BannedUsersEntity[]): Promise<any> {
    const mappedUsers = [];
    for await (const user of users) {
      mappedUsers.push(await this.mapBannedUserEntity(user));
    }
    return mappedUsers;
  }

  async countBannedUsersBySearchLogin(searchNameTerm: string) {
    const res = await this.bannedUsersRepo
      .createQueryBuilder("u")
      .where("LOWER(u.login) like LOWER(:login)", {
        login: `%${searchNameTerm}%`,
      })
      .getCount();
    return res;
  }
}
