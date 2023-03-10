import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BadRequestException, Inject } from "@nestjs/common";
import { IUsersRepo, IUsersRepoToken } from "../../users/DAL/IUsersRepo";
import { UserEntity } from "../../users/entity/user.entity";
import { v4 as uuidv4 } from "uuid";
import { EmailService } from "../../common/email/email.service";
import {
  IUsersQueryRepo,
  IUsersQueryRepoToken,
} from "../../users/DAL/IUserQueryRepo";

export class ResendRegistrationEmailCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(ResendRegistrationEmailCommand)
export class ResendRegistrationEmailHandler
  implements ICommandHandler<ResendRegistrationEmailCommand>
{
  constructor(
    @Inject(IUsersRepoToken)
    private readonly usersRepo: IUsersRepo<UserEntity>,
    @Inject(IUsersQueryRepoToken)
    private readonly usersQueryRepo: IUsersQueryRepo<UserEntity>,
    private readonly emailService: EmailService,
  ) {}

  async execute(command: ResendRegistrationEmailCommand): Promise<any> {
    const userByEmailIsExisted = await this.usersQueryRepo
      .findByEmail(command.email)
      .then((res) => res[0]);

    if (!userByEmailIsExisted) {
      throw new BadRequestException("email not exists");
    }
    if (userByEmailIsExisted.isConfirmed) {
      throw new BadRequestException("email already confirmed");
    }
    const code = uuidv4();
    const user = await this.usersRepo.updateConfirmationCode(
      command.email,
      code,
    );
    console.log(`...sending to ${command.email}, code: ${code}`);

    await this.emailService.resendRegistrationEmail(command.email, code);

    return true;
  }
}
