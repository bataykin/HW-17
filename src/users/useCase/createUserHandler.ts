import { CreateUserDto } from "../dto/create.user.dto";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { IUsersRepo, IUsersRepoToken } from "../IUsersRepo";
import { UserEntity } from "../entity/user.entity";
import { AuthUtilsClass } from "../../auth/auth.utils";
import { v4 as uuidv4 } from "uuid";
import { Custom400exception } from "../../common/exceptions/custom400exception";

export class SA_CreateUserCommand {
  constructor(public readonly dto: CreateUserDto) {}
}

@CommandHandler(SA_CreateUserCommand)
export class CreateUserHandler
  implements ICommandHandler<SA_CreateUserCommand>
{
  constructor(
    @Inject(IUsersRepoToken)
    private readonly usersRepo: IUsersRepo<UserEntity>,
    private readonly authUtils: AuthUtilsClass,
  ) {}

  async execute(command: SA_CreateUserCommand): Promise<any> {
    const { dto } = command;
    const isLoginEmailExists = await this.usersRepo.checkLoginEmailExists(
      dto.login,
      dto.email,
    );
    if (isLoginEmailExists) {
      throw new Custom400exception(
        isLoginEmailExists,
        isLoginEmailExists.split(' ')[0],
      );
    }
    const passwordHash = await this.authUtils._generateHash(dto.password);
    const code = uuidv4();
    const user = await this.usersRepo.createUser(
      dto.login,
      dto.email,
      passwordHash,
      code,
    );

    const result = await this.usersRepo.mapUserEntityToResponse(user);
    return result;
  }
}
