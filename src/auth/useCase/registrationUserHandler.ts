import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {RegistrationDto} from "../dto/registration.dto";
import {BadRequestException, Inject} from "@nestjs/common";
import {IUsersRepo, IUsersRepoToken} from "../../users/IUsersRepo";
import {UserEntity} from "../../users/entity/user.entity";
import {AuthUtilsClass} from "../auth.utils";
import { v4 as uuidv4 } from 'uuid';
import {EmailService} from "../../common/email/email.service";

export class RegistrationUserCommand {
    constructor(public readonly dto: RegistrationDto) {
    }
}
@CommandHandler(RegistrationUserCommand)
export class RegistrationUserHandler implements  ICommandHandler<RegistrationUserCommand>{
    constructor(@Inject(IUsersRepoToken) private readonly usersRepo: IUsersRepo<UserEntity>,
                private readonly authUtils: AuthUtilsClass,
                private readonly emailService: EmailService) {
    }
    async execute(command: RegistrationUserCommand): Promise<any> {
        const {password,email,login} = command.dto
        const isCredentialsExists = await this.usersRepo.checkLoginEmailExists(login, email)
        if (isCredentialsExists) {
            throw new BadRequestException(isCredentialsExists)
        }

        const passwordHash = await this.authUtils._generateHash(password)
        const code = uuidv4()

        // console.log(`UNCOMMENT in registration() in auth.ORM.service to REAL send confirmation code ${code} to ${email}`)
        await this.emailService.sendConfirmationOfRegistrationMail(email, code)

        return this.usersRepo.createUser(login, email, passwordHash, code)
    }

}