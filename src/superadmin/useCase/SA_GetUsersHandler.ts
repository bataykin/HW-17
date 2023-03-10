import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { UserEntity } from "../../users/entity/user.entity";
import {
  IUsersQueryRepo,
  IUsersQueryRepoToken,
} from "../../users/DAL/IUserQueryRepo";
import { PaginatorModel } from "../../common/PaginatorModel";
import { SA_UserViewModel } from "../dto/SA_UserViewModel";
import { SAGetUsersPaginationModel } from "../dto/SAGetUsersPaginationModel";
import { BanStatusEnum } from "../banStatusEnum";

export class SA_GetUsersQuery {
  constructor(public readonly dto: SAGetUsersPaginationModel) {}
}

@QueryHandler(SA_GetUsersQuery)
export class SA_GetUsersHandler implements IQueryHandler<SA_GetUsersQuery> {
  constructor(
    @Inject(IUsersQueryRepoToken)
    private readonly usersQueryRepo: IUsersQueryRepo<UserEntity>,
  ) {}
  async execute(
    query: SA_GetUsersQuery,
  ): Promise<PaginatorModel<SA_UserViewModel[]>> {
    const paging = {
      banStatus: query.dto.banStatus ?? BanStatusEnum.all,
      searchLoginTerm: query.dto.searchLoginTerm?.toUpperCase() ?? null,
      searchEmailTerm: query.dto.searchEmailTerm?.toUpperCase() ?? null,
      sortBy: query.dto.sortBy ?? "createdAt",
      sortDirection: query.dto.sortDirection ?? "desc",
      pageNumber: query.dto.pageNumber ?? 1,
      pageSize: query.dto.pageSize ?? 10,
      skipSize:
        +query.dto.pageNumber > 1
          ? +query.dto.pageSize * (+query.dto.pageNumber - 1)
          : 0,
    } as SAGetUsersPaginationModel;
    const {
      searchLoginTerm,
      searchEmailTerm,
      pageSize,
      pageNumber,
      banStatus,
    } = paging;

    const users = await this.usersQueryRepo.SA_GetUsers(paging);
    const mappedUsers: SA_UserViewModel[] =
      await this.usersQueryRepo.SA_mapUserEntitiesToResponse(users);

    // const docCount = await this.usersQueryRepo
    //   .SA_CountUsersBySearch(searchLoginTerm, searchEmailTerm, banStatus)
    //   .then((res) => +res[0].total);

    const docCount = mappedUsers.length;
    return {
      pagesCount: Math.ceil(+docCount / +pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +docCount,
      items: mappedUsers,
    };
  }
}
