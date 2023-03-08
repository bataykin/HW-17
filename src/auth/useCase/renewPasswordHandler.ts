import {CommandBus, CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {IUsersRepo, IUsersRepoToken} from "../../users/IUsersRepo";
import {UserEntity} from "../../users/entity/user.entity";
import {BadRequestException, Inject} from "@nestjs/common";
import {AuthUtilsClass} from "../auth.utils";

export class RenewPasswordCommand {
    constructor(public readonly newPassword: string,
                public readonly recoveryCode: string) {
    }
}

@CommandHandler(RenewPasswordCommand)
export class RenewPasswordHandler implements ICommandHandler<RenewPasswordCommand> {
    constructor(@Inject(IUsersRepoToken)
                private readonly usersRepo: IUsersRepo<UserEntity>,
                private readonly authUtils: AuthUtilsClass) {
    }

    async execute(command: RenewPasswordCommand): Promise<any> {
        const {newPassword, recoveryCode} = command
       const recoveryCodeExists = await this.usersRepo.checkPassRecoveryCodeIsValid(recoveryCode)
        if (!recoveryCodeExists) {
            throw new BadRequestException('recovery code incorrect or not exists')
        }
        const passwordHash = await this.authUtils._generateHash(newPassword)
        await this.usersRepo.renewPassword(recoveryCode, passwordHash)
    }

}