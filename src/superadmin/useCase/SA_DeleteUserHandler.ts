import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject, NotFoundException } from "@nestjs/common";
import { IUsersRepo, IUsersRepoToken } from "../../users/DAL/IUsersRepo";
import { UserEntity } from "../../users/entity/user.entity";
import {
  IUsersQueryRepo,
  IUsersQueryRepoToken,
} from "../../users/DAL/IUserQueryRepo";

export class SA_DeleteUserCommand {
  constructor(public readonly id: string) {}
}
@CommandHandler(SA_DeleteUserCommand)
export class SA_DeleteUserHandler
  implements ICommandHandler<SA_DeleteUserCommand>
{
  constructor(
    @Inject(IUsersQueryRepoToken)
    private readonly usersQueryRepo: IUsersQueryRepo<UserEntity>,
    @Inject(IUsersRepoToken)
    private readonly usersRepo: IUsersRepo<UserEntity>,
  ) {}
  async execute(command: SA_DeleteUserCommand): Promise<any> {
    try {
      const user = await this.usersQueryRepo.findById(command.id);

      if (!user) {
        throw new NotFoundException("net takogo uzerka");
      }
    } catch (e) {
      if (e.name == "NotFoundException") {
        throw new NotFoundException("net takogo userka");
      } else throw new NotFoundException(e);
    }
    return await this.usersRepo.deleteUser(command.id);
  }
}
