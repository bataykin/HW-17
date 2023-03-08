import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { CreateUserPaginatedDto } from "../dto/create.user.paginated.dto";
import { Inject } from "@nestjs/common";
import { IUsersRepo, IUsersRepoToken } from "../IUsersRepo";
import { UserEntity } from "../entity/user.entity";

export class SA_GetUsersQuery {
  constructor(public readonly dto: CreateUserPaginatedDto) {}
}

@QueryHandler(SA_GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<SA_GetUsersQuery> {
  constructor(
    @Inject(IUsersRepoToken)
    private readonly usersRepo: IUsersRepo<UserEntity>,
  ) {}
  async execute(query: SA_GetUsersQuery): Promise<any> {
    const {
      pageNumber = 1,
      pageSize = 10,
      sortBy = 'createdAt',
      sortDirection = 'desc',
      searchEmailTerm = '',
      searchLoginTerm = '',
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
    const users = await this.usersRepo.getUsersPaginated(usersPaginationBLLdto);

    const mappedUsers = await this.usersRepo.mapArrayOfUserEntitiesToResponse(
      users,
    );

    const docCount = await this.usersRepo.countUsersBySearchname(
      searchLoginTerm,
      searchEmailTerm,
    );
    return {
      pagesCount: Math.ceil(docCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: docCount,
      items: mappedUsers,
    };
  }
}
