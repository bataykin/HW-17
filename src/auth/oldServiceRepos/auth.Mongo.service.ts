import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { RegistrationDto } from "../dto/registration.dto";
import { addDays, addSeconds } from "date-fns";
import { AuthUtilsClass } from "../auth.utils";
import { v4 as uuidv4 } from "uuid";
import { EmailService } from "../../common/email/email.service";
import { request } from "express";
import { JwtService } from "@nestjs/jwt";
import { JwtServiceClass } from "../../common/jwt/jwt-service-class.service";
import { jwtConstants } from "../constants";
import { InjectModel } from "@nestjs/mongoose";
import { RefreshToken, RefreshTokenDocument } from "../../common/jwt/refresh.token.schema";
import { Model } from "mongoose";
import { UsersMongoRepo } from "../../users/oldServiceRepos/users.Mongo.repo";
import { AAuthService } from "./IAuthService";

const bcrypt = require('bcrypt');


@Injectable()
export class AuthMongoService implements AAuthService{
    constructor(protected readonly usersRepository: UsersMongoRepo,
                protected readonly authUtils: AuthUtilsClass,
                protected readonly emailService: EmailService,
                private readonly jwtServiceClass: JwtServiceClass,
                private jwtService: JwtService,
                @InjectModel(RefreshToken.name) private refreshTokenModel: Model<RefreshTokenDocument>,
                /*@InjectModel(User.name) private userModel: Model<UserDocument>*/) {
    }

    async confirmRegistration(code: string) {

        const isUserByCodeExists = await this.usersRepository.checkCodeExists(code)
        if ((!isUserByCodeExists) || (isUserByCodeExists.emailConfirmation.isConfirmed)) {
            throw new BadRequestException("code already confirmed or not exists")
        }

        const result = await this.usersRepository.confirmEmail(code, request.get('ip'))
        return result

    }


    async registration({login, email, password}: RegistrationDto) {

        const isCredentialsExists = await this.usersRepository.checkLoginEmailExists(login, email)
        if (isCredentialsExists) {
            throw new BadRequestException(isCredentialsExists)
            // throw new HttpException('bad requesr', HttpStatus.BAD_REQUEST);
        }

        const passwordHash = await this.authUtils._generateHash(password)

        const newUser: any = {
            // _id: new ObjectId(),
            accountData: {
                login: login,
                email: email,
                passwordHash: passwordHash,
                createdAt: new Date()
            },
            emailConfirmation: {
                isConfirmed: false,
                confirmationCode: uuidv4(),
                expirationDate: addDays(new Date(), 1),
                sentEmails: [{
                    sentDate: new Date()
                }],
            },

        }


        console.log(`UNCOMMENT registration() in auth.service to REAL send confirmation code ${newUser.emailConfirmation.confirmationCode} to ${newUser.accountData.email}`)
        // await this.emailService.sendConfirmationOfRegistrationMail(newUser.accountData.email)

        return this.usersRepository.createUser(newUser)

    }

    async resendRegistrationEmail(email: string) {

        const userByEmailIsExisted = await this.usersRepository.findByEmail(email)
        if ((!userByEmailIsExisted) || (userByEmailIsExisted?.emailConfirmation.isConfirmed)) {
            throw new NotFoundException('Already confirmed or email not exists')
        }


        await this.emailService.resendRegistrationEmail(email, request.get('ip'))

        return true

    }

    async login(user: any) {
        const payload = {username: user.accountData.login, sub: user.id};
        const accToken = this.jwtService.sign(payload, {expiresIn: jwtConstants.accessTokenExpiresIn})
        const refToken = this.jwtService.sign(payload, {expiresIn: jwtConstants.refreshTokenExpiresIn})

        await this.refreshTokenModel.insertMany({
            token: refToken,
            isValid: true,
            expiresAt: addSeconds(new Date(), 20),
        })


        return {
            accessToken: accToken,
            refreshToken: refToken
        };


    }

    async getTokenFromDB(token: any) {
        return 'not implemented)'
    }

    async refreshTokens(token: string, userId: string) {
        const userFromToken = await this.usersRepository.findOne({_id: userId})
        if (!userFromToken) {
            throw  new UnauthorizedException('user in token not found')
        }
        const newPayload = {username: userFromToken.accountData.login, sub: userId};
        const accToken = this.jwtService.sign(newPayload, {expiresIn: jwtConstants.accessTokenExpiresIn})
        const refToken = this.jwtService.sign(newPayload, {expiresIn: jwtConstants.refreshTokenExpiresIn})

        // sign old token as invalid in DB
        await this.refreshTokenModel.findOneAndUpdate(
            {token: token},
            {isValid: false, replacedBy: refToken})

        // create new DB record for new token
        await this.refreshTokenModel.insertMany({
            token: refToken,
            isValid: true,
            expiresAt: addSeconds(new Date(), 20)
        })

        return {
            accessToken: accToken,
            refreshToken: refToken
        };


    }


    async aboutMe(userId: string) {
        const detectedUser = await this.usersRepository.findOne({_id: userId})
        const result =  {
            "email": detectedUser.accountData.email,
            "login": detectedUser.accountData.login,
            "userId": userId
        }
        return result

    }


    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersRepository.findOne({"accountData.login": username});
        if (!user) {
            throw new UnauthorizedException('netu takogo logina')
        }
        const isEqual = await bcrypt.compare(pass, user.accountData.passwordHash)
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
        await this.refreshTokenModel.findOneAndUpdate(
            {token: refToken},
            {isValid: false, replacedBy: 'logout'})
    }
}
