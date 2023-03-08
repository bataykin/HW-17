import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject, NotFoundException } from "@nestjs/common";
import { IUsersRepo, IUsersRepoToken } from "../IUsersRepo";
import { UserEntity } from "../entity/user.entity";

export class SA_DeleteUserCommand {
  constructor(public readonly id: string) {}
}
@CommandHandler(SA_DeleteUserCommand)
export class DeleteUserHandler
  implements ICommandHandler<SA_DeleteUserCommand>
{
  constructor(
    @Inject(IUsersRepoToken)
    private readonly usersRepo: IUsersRepo<UserEntity>,
  ) {}
  async execute(command: SA_DeleteUserCommand): Promise<any> {
    try {
      const user = await this.usersRepo.findById(command.id);
      if (!user) {
        throw new NotFoundException('net takogo uzerka');
      }
      // return user
    } catch (e) {
      if (e.name == 'NotFoundException') {
        throw new NotFoundException('net takogo userka');
      } else throw new NotFoundException(e);
    }
    return await this.usersRepo.deleteUser(command.id);
  }
}
