import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {passRecoveryDto} from "../dto/passRecoveryDto";
import {Inject} from "@nestjs/common";
import {IUsersRepo, IUsersRepoToken} from "../../users/IUsersRepo";
import {UserEntity} from "../../users/entity/user.entity";
import { v4 as uuidv4 } from 'uuid';
import {EmailService} from "../../common/email/email.service";

export class PasswordRecoveryCommand {
    constructor(public readonly dto: passRecoveryDto) {
    }
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryHandler implements ICommandHandler<PasswordRecoveryCommand>{
    constructor(@Inject(IUsersRepoToken)
    public readonly usersRepo: IUsersRepo<UserEntity>,
                public readonly emailService: EmailService) {
    }
    async execute(command: PasswordRecoveryCommand): Promise<any> {
        const {email} = command.dto
        const passRecoveryCode = uuidv4()
        const updatedUser = await this.usersRepo.addPasswordRecoveryCode(email, passRecoveryCode)
        const msg =
            `<h1>Password recovery</h1>
        <p>To finish password recovery please follow the link below:
            <a href='https://somesite.com/password-recovery?recoveryCode=${passRecoveryCode}'>recovery password</a>
        </p>`
        await this.emailService.sendEmail(email,'Password recovery code', msg)
    }


}