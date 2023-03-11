import { CreateUserDto } from "../../users/dto/create.user.dto";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BadRequestException, Inject } from "@nestjs/common";
import { IUsersRepo, IUsersRepoToken } from "../../users/DAL/IUsersRepo";
import { UserEntity } from "../../users/entity/user.entity";
import { AuthHashClass } from "../../auth/auth.utils";
import { v4 as uuidv4 } from "uuid";
import { SA_UserViewModel } from "../dto/SA_UserViewModel";
import {
  IUsersQueryRepo,
  IUsersQueryRepoToken,
} from "../../users/DAL/IUserQueryRepo";

export class SA_CreateUserCommand {
  constructor(public readonly dto: CreateUserDto) {}
}

@CommandHandler(SA_CreateUserCommand)
export class SA_CreateUserHandler
  implements ICommandHandler<SA_CreateUserCommand>
{
  constructor(
    @Inject(IUsersQueryRepoToken)
    private readonly usersQueryRepo: IUsersQueryRepo<UserEntity>,
    @Inject(IUsersRepoToken)
    private readonly usersRepo: IUsersRepo<UserEntity>,
    private readonly authUtils: AuthHashClass,
  ) {}

  async execute(command: SA_CreateUserCommand): Promise<SA_UserViewModel> {
    const { dto } = command;
    const isLoginEmailExists = await this.usersQueryRepo.checkLoginEmailExists(
      dto.login,
      dto.email,
    );
    if (isLoginEmailExists) {
      throw new BadRequestException(isLoginEmailExists);
    }
    const passwordHash = await this.authUtils._generateHash(dto.password);
    const confirmationCode = uuidv4();
    const user: UserEntity = await this.usersRepo.createUser(
      dto.login,
      dto.email,
      passwordHash,
      confirmationCode,
    );
    const newUser = await this.usersQueryRepo.findById(user.id);
    const result: SA_UserViewModel =
      await this.usersQueryRepo.SA_mapUserEntityToResponse(newUser);
    return result;
  }
}
