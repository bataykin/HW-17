import { AAuthService } from "./IAuthService";
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { RegistrationDto } from "../dto/registration.dto";
import { AuthUtilsClass } from "../auth.utils";
import { EmailService } from "../../common/email/email.service";
import { JwtServiceClass } from "../../common/jwt/jwt-service-class.service";
import { JwtService } from "@nestjs/jwt";
import { UsersORMRepo } from "../../users/oldServiceRepos/users.ORM.repo";
import { jwtConstants } from "../constants";
import { v4 as uuidv4 } from "uuid";
import { ReftokenORMRepo } from "./reftoken.ORM.repo";

const bcrypt = require('bcrypt');


@Injectable()
export class AuthORMService implements AAuthService {
    constructor(protected readonly reftokensRepo: ReftokenORMRepo,
                protected readonly usersRepository: UsersORMRepo,
                protected readonly authUtils: AuthUtilsClass,
                protected readonly emailService: EmailService,
                private readonly jwtServiceClass: JwtServiceClass,
                private jwtService: JwtService) {
    }


    async aboutMe(userId: string): Promise<any> {
        const detectedUser = await this.usersRepository.findById(userId)
        const result = {
            "email": detectedUser.email,
            "login": detectedUser.login,
            "userId": userId.toString()
        }
        return result

    }

    async confirmRegistration(code: string): Promise<any> {
        const isUserByCodeExists = await this.usersRepository.checkCodeExists(code)

        if ((!isUserByCodeExists) || (isUserByCodeExists[0]["isConfirmed"])) {
            throw new BadRequestException("code already confirmed or not exists")
        }
        const result = await this.usersRepository.confirmEmail(code)
        return result
    }

    async login(user: any): Promise<any> {
        const payload = {username: user.login, sub: user.id};
        const accToken = this.jwtService.sign(payload, {
            expiresIn: jwtConstants.accessTokenExpiresIn,
            secret: jwtConstants.secret
        })
        const refToken = this.jwtService.sign(payload, {
            expiresIn: jwtConstants.refreshTokenExpiresIn,
            secret: jwtConstants.secret
        })

        await this.reftokensRepo.addReftokenDB(refToken)


        return {
            accessToken: accToken,
            refreshToken: refToken
        };

    }

    async logoutUser(refToken: any): Promise<any> {
        return await this.reftokensRepo.revokeTokenLogout(refToken)
    }
    async getTokenFromDB(token: any){
        return await this.reftokensRepo.getTokenFromDB(token)
    }

    async refreshTokens(token: string, userId: string): Promise<any> {
        const userFromToken = await this.usersRepository.findById(userId)
        if (!userFromToken) {
            throw  new UnauthorizedException('user in token not found')
        }

        const tokenInDB = await this.reftokensRepo.getTokenFromDB(token)
        if (!tokenInDB || !tokenInDB.isValid) {
            throw new UnauthorizedException('refresh token is invalid')
        }
        const newPayload = {username: userFromToken.login, sub: userId};
        const accToken = this.jwtService.sign(newPayload, {
            expiresIn: jwtConstants.accessTokenExpiresIn,
            secret: jwtConstants.secret
        })
        const refToken = this.jwtService.sign(newPayload, {
            expiresIn: jwtConstants.refreshTokenExpiresIn,
            secret: jwtConstants.secret
        })


        await this.reftokensRepo.renewReftokenDB(refToken, token)


        return {
            accessToken: accToken,
            refreshToken: refToken
        };

    }

    async registration({login, email, password}: RegistrationDto): Promise<any> {
        const isCredentialsExists = await this.usersRepository.checkLoginEmailExists(login, email)
        if (isCredentialsExists) {
            throw new BadRequestException(isCredentialsExists)
        }

        const passwordHash = await this.authUtils._generateHash(password)
        const code = uuidv4()

        console.log(`UNCOMMENT in registration() in auth.ORM.service to REAL send confirmation code ${code} to ${email}`)
        // await this.emailService.sendConfirmationOfRegistrationMail(email, code)

        return this.usersRepository.createUser(login, email, passwordHash, code)
    }

    async resendRegistrationEmail(email: string): Promise<any> {
        const userByEmailIsExisted = await this.usersRepository.findByEmail(email)
        if ((!userByEmailIsExisted) || (userByEmailIsExisted[0]["isConfirmed"])) {
            throw new NotFoundException('Already confirmed or email not exists')
        }
        const code = uuidv4()
        const user = await this.usersRepository.updateConfirmationCode(email, code)
        console.log(`UNCOMMENT resendRegistrationEmail() in auth.ORM.service to REAL resend  NEW confirmation code ${code} to ${email}`)
        // await this.emailService.resendRegistrationEmail(email, user[0]["confirmationCode"])

        return true
    }

    async retrieveUser(refToken: string): Promise<any> {
        try {
            const user = await this.jwtService.verify(refToken, {secret: jwtConstants.secret})
            if (!user) {
                throw new UnauthorizedException('user protyX')
            }
            return user
        } catch (e) {
            throw new UnauthorizedException('TokenExpiredError: jwt expired')
        }
    }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersRepository.findByLogin(username);
        if (!user) {
            throw new UnauthorizedException('netu takogo logina')
        }
        const isEqual = await bcrypt.compare(pass, user[0]["passwordHash"])
        if (!isEqual) {
            throw new UnauthorizedException('parol ne podhodit')
        }
        return user;
    }

}