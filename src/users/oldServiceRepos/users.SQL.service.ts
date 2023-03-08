import {BadRequestException, Injectable, NotFoundException} from "@nestjs/common";
import {UsersSQLRepo} from "./users.SQL.repo";
import {AuthUtilsClass} from "../../auth/auth.utils";
import {CreateUserPaginatedDto} from "../dto/create.user.paginated.dto";
import {CreateUserDto} from "../dto/create.user.dto";
import {addDays} from "date-fns";
import {Types} from "mongoose";
import {v4 as uuidv4} from "uuid";
import {AUserService} from "./IUserService";


@Injectable()
export class UsersSQLService implements AUserService{
    constructor(private readonly usersRepository: UsersSQLRepo,
                protected readonly authUtils: AuthUtilsClass) {
    }

    findAll(dto: CreateUserPaginatedDto) {
        return this.usersRepository.getAll(dto)
    }

    async create(dto: CreateUserDto) {
        // check that email and login is unique
        const isCredentialsExists = await this.usersRepository.checkLoginEmailExists(dto.login, dto.email)
        if (isCredentialsExists) {
            throw new BadRequestException(isCredentialsExists)
        }

        const passwordHash = await this.authUtils._generateHash(dto.password)
        const code = uuidv4()
        const user = await this.usersRepository.createUser(dto.login, dto.email, passwordHash, code)
        const confirmUser = await this.usersRepository.confirmEmail(code)
        return user[0]
    }

    async delete(id: string) {
        const user = await this.findById(id)
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