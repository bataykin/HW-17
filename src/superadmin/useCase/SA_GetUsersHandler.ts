import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { CreateUserPaginatedDto } from "../../users/dto/create.user.paginated.dto";
import { Inject } from "@nestjs/common";
import { UserEntity } from "../../users/entity/user.entity";
import {
  IUsersQueryRepo,
  IUsersQueryRepoToken,
} from "../../users/DAL/IUserQueryRepo";

export class SA_GetUsersQuery {
  constructor(public readonly dto: CreateUserPaginatedDto) {}
}

@QueryHandler(SA_GetUsersQuery)
export class SA_GetUsersHandler implements IQueryHandler<SA_GetUsersQuery> {
  constructor(
    @Inject(IUsersQueryRepoToken)
    private readonly usersQueryRepo: IUsersQueryRepo<UserEntity>,
  ) {}
  async execute(query: SA_GetUsersQuery): Promise<any> {
    const {
      pageNumber = 1,
      pageSize = 10,
      sortBy = "createdAt",
      sortDirection = "desc",
      searchEmailTerm = "",
      searchLoginTerm = "",
      skipSize = +pageNumber > 1 ? +pageSize * (+pageNumber - 1) : 0,
    } = query.dto;
    const usersPaginationBLLdto = {
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      skipSize,
      searchLoginTerm,
      searchEmailTerm,
    };
    const users = await this.usersQueryRepo.getUsers(usersPaginationBLLdto);

    // const mappedUsers: SAUserViewModel[] =
    //   await this.usersQueryRepo.mapArrayOfUserEntitiesToResponse(users);

    const docCount = await this.usersQueryRepo.countUsersBySearchname(
      searchLoginTerm,
      searchEmailTerm,
    );
    return {
      pagesCount: Math.ceil(docCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: docCount,
      items: users,
    };
  }
}
