import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { AuthUtilsClass } from "../auth.utils";
import { EmailService } from "../../common/email/email.service";
import { JwtServiceClass } from "../../common/jwt/jwt-service-class.service";
import { JwtService } from "@nestjs/jwt";
import { RegistrationDto } from "../dto/registration.dto";
import { jwtConstants } from "../constants";
import { UsersSQLRepo } from "../../users/oldServiceRepos/users.SQL.repo";
import { v4 as uuidv4 } from "uuid";
import { ReftokenSQLRepo } from "./reftoken.SQL.repo";
import { AAuthService } from "./IAuthService";

const bcrypt = require('bcrypt');


@Injectable()
export class AuthSQLService implements AAuthService{
    constructor(protected readonly reftokensRepo: ReftokenSQLRepo,
                protected readonly usersRepository: UsersSQLRepo,
                protected readonly authUtils: AuthUtilsClass,
                protected readonly emailService: EmailService,
                private readonly jwtServiceClass: JwtServiceClass,
                private jwtService: JwtService) {
    }


    async confirmRegistration(code: string) {

        const isUserByCodeExists = await this.usersRepository.checkCodeExists(code)

        if ((!isUserByCodeExists) || (isUserByCodeExists[0]["isConfirmed"])) {
            throw new BadRequestException("code already confirmed or not exists")
        }
        const result = await this.usersRepository.confirmEmail(code)
        return result

    }


    async registration({login, email, password}: RegistrationDto) {

        const isCredentialsExists = await this.usersRepository.checkLoginEmailExists(login, email)
        if (isCredentialsExists) {
            throw new BadRequestException(isCredentialsExists)
        }

        const passwordHash = await this.authUtils._generateHash(password)
        const code = uuidv4()

        console.log(`UNCOMMENT registration() in auth.SQL.service to REAL send confirmation code ${code} to ${email}`)
        // await this.emailService.sendConfirmationOfRegistrationMail(email, code)

        return this.usersRepository.createUser(login, email, passwordHash, code)

    }

    async resendRegistrationEmail(email: string) {

        const userByEmailIsExisted = await this.usersRepository.findByEmail(email)
        if ((!userByEmailIsExisted) || (userByEmailIsExisted[0]["isConfirmed"])) {
            throw new NotFoundException('Already confirmed or email not exists')
        }
        const code = uuidv4()
        const user = await this.usersRepository.updateConfirmationCode(email, code)
        console.log(`UNCOMMENT resendRegistrationEmail() in auth.SQL.service to REAL resend  NEW confirmation code ${code} to ${email}`)

        // await this.emailService.resendRegistrationEmail(email, user[0]["confirmationCode"])

        return true

    }

    async login(user: any) {
        const payload = {username: user.login, sub: user.id};

        const accToken = this.jwtService.sign(payload, {expiresIn: jwtConstants.accessTokenExpiresIn})
        const refToken = this.jwtService.sign(payload, {expiresIn: jwtConstants.refreshTokenExpiresIn})

        //TODO to make DB RefTokens

       await this.reftokensRepo.addReftokenDB(refToken)


        return {
            accessToken: accToken,
            refreshToken: refToken
        };


    }
    async getTokenFromDB (token: any){
        return await this.reftokensRepo.getTokenFromDB(token)
    }


    async refreshTokens(token: string, userId: string) {
        const userFromToken = await this.usersRepository.findById(userId)
        if (!userFromToken) {
            throw  new UnauthorizedException('user in token not found')
        }

        const tokenInDB = await this.reftokensRepo.getTokenFromDB(token)
        if (!tokenInDB[0].isValid) {
            throw new UnauthorizedException('refresh token is invalid')
        }
        const newPayload = {username: userFromToken[0].login, sub: userId};
        const accToken = this.jwtService.sign(newPayload, {expiresIn: jwtConstants.accessTokenExpiresIn})
        const refToken = this.jwtService.sign(newPayload, {expiresIn: jwtConstants.refreshTokenExpiresIn})


        await this.reftokensRepo.renewReftokenDB(refToken, token)


        return {
            accessToken: accToken,
            refreshToken: refToken
        };


    }


    async aboutMe(userId: string) {
        const detectedUser = await this.usersRepository.findById(userId)
        const result = {
            "email": detectedUser[0].email,
            "login": detectedUser[0].login,
            "userId": userId
        }
        return result

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


    async retrieveUser(refToken: string) {
        // console.log('retrieve user for token ' + refToken)
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

    async logoutUser(refToken: any) {

        return await this.reftokensRepo.revokeTokenLogout(refToken)
    }

}