import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BadRequestException, Inject } from "@nestjs/common";
import { IUsersRepo, IUsersRepoToken } from "../../users/IUsersRepo";
import { UserEntity } from "../../users/entity/user.entity";

export class ConfirmRegistrationCommand {
    constructor(
        public readonly code: string) {

    }
}

@CommandHandler(ConfirmRegistrationCommand)
export class ConfirmRegistrationHandler implements ICommandHandler<ConfirmRegistrationCommand>{
    constructor(@Inject(IUsersRepoToken) private readonly usersRepo: IUsersRepo<UserEntity>) {
    }
    async execute(command: ConfirmRegistrationCommand): Promise<any> {
        const isUserByCodeExists = await this.usersRepo.checkCodeExists(command.code)
        if ((!isUserByCodeExists) || (isUserByCodeExists["isConfirmed"])) {
            throw new BadRequestException("code already confirmed or not exists")
        }
        const result = await this.usersRepo.confirmEmail(command.code)
        return result
    }

}