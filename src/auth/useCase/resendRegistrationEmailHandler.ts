import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {BadRequestException, Inject, NotFoundException} from "@nestjs/common";
import {IUsersRepo, IUsersRepoToken} from "../../users/IUsersRepo";
import {UserEntity} from "../../users/entity/user.entity";
import {AuthUtilsClass} from "../auth.utils";
import {v4 as uuidv4} from 'uuid';
import {EmailService} from "../../common/email/email.service";
import {log} from "util";

export class ResendRegistrationEmailCommand {
    constructor(public readonly email: string) {
    }

}

@CommandHandler(ResendRegistrationEmailCommand)
export class ResendRegistrationEmailHandler implements ICommandHandler<ResendRegistrationEmailCommand> {
    constructor(@Inject(IUsersRepoToken) private readonly usersRepo: IUsersRepo<UserEntity>,
                private readonly emailService: EmailService) {
    }

    async execute(command: ResendRegistrationEmailCommand): Promise<any> {
        const userByEmailIsExisted = await this.usersRepo.findByEmail(command.email)
        if ((!userByEmailIsExisted) ) {
            throw new BadRequestException('email not exists')
        }
        if (userByEmailIsExisted["isConfirmed"]){
            throw new BadRequestException('email already confirmed')
        }
        const code = uuidv4()
        const user = await this.usersRepo.updateConfirmationCode(command.email, code)
        // console.log(`UNCOMMENT resendRegistrationEmail() in auth.ORM.service to REAL resend  NEW confirmation code ${code} to ${command.email}`)
        await this.emailService.resendRegistrationEmail(command.email,code)

        return true
    }

}