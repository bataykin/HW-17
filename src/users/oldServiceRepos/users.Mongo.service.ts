import {
    BadRequestException,
    Get,
    Injectable,
    NotFoundException,
    Query,
    UseFilters,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import {CreateUserPaginatedDto} from "../dto/create.user.paginated.dto";
import {CreateUserDto} from "../dto/create.user.dto";
import {InjectModel, Prop} from "@nestjs/mongoose";
import {User, UserDocument} from "../user.schema";
import {Model, Types} from "mongoose";
import {HttpExceptionFilter} from "../../http-exception.filter";
import { AuthUtilsClass} from "../../auth/auth.utils";
import {addDays} from "date-fns";
import {v4 as uuidv4} from "uuid";
import {create} from "domain";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {AUserService, IUserService} from "./IUserService";
import {UsersMongoRepo} from "./users.Mongo.repo";


@Injectable()
export class UsersMongoService implements AUserService{
    constructor(
        protected usersRepository: UsersMongoRepo,
        protected readonly authUtils: AuthUtilsClass,
/*        @InjectRepository(User)
        private usersRepository: Repository<User>,*/
    ) {
    }


    findAll(dto: CreateUserPaginatedDto) {
        return this.usersRepository.getAll(dto)
    }


    // @UsePipes(new ValidationPipe())
    // @UseFilters(new HttpExceptionFilter())

    async create(dto: CreateUserDto) {

        // check that email and login is unique
        const isCredentialsExists = await this.usersRepository.checkLoginEmailExists(dto.login, dto.email)
        if (isCredentialsExists) {
            throw new BadRequestException(isCredentialsExists)
        }

        const passwordHash = await this.authUtils._generateHash(dto.password)

        const newUser: any = {
            // _id: new ObjectId(),
            accountData: {
                login: dto.login,
                email: dto.email,
                passwordHash: passwordHash,
                createdAt: new Date()
            },
            emailConfirmation: {
                isConfirmed: true,
                confirmationCode: uuidv4(),
                expirationDate: addDays(new Date(), 1),
                sentEmails: [{
                    sentDate: new Date()
                }],
            },



        }

        // console.log(newUser)
        // const userInstance: UserAccountDBType = new UserAccountDBType(newUser._id, newUser.accountData, newUser.emailConfirmation)
        // return await this.usersRepository.createUser(userInstance)
        return this.usersRepository.createUser(newUser)
    }

    async delete(id: string) {
        return await this.usersRepository.delete(id);
    }

    async findById(id: string) {
        try {
            const user = await this.usersRepository.findById(id)
            if (user.length == 0) {
                throw new NotFoundException('net takogo userka')
            }
            return user[0]
        } catch (e) {
            if (e.name == 'NotFoundException') {
                throw new NotFoundException('net takogo userka')
            } else throw new NotFoundException(e)
        }
    }
}
