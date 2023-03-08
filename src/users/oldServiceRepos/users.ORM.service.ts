import {AUserService} from "./IUserService";
import {CreateUserDto} from "../dto/create.user.dto";
import {CreateUserPaginatedDto} from "../dto/create.user.paginated.dto";
import {BadRequestException, Injectable, NotFoundException} from "@nestjs/common";
import {UsersSQLRepo} from "./users.SQL.repo";
import {AuthUtilsClass} from "../../auth/auth.utils";
import {UsersORMRepo} from "./users.ORM.repo";
import {v4 as uuidv4} from "uuid";
import {use} from "passport";

@Injectable()
export class UsersORMService implements AUserService{
    constructor(private readonly usersRepository: UsersORMRepo,
                protected readonly authUtils: AuthUtilsClass) {
    }

    async create(dto: CreateUserDto) {
        const isCredentialsExists = await this.usersRepository.checkLoginEmailExists(dto.login, dto.email)
        if (isCredentialsExists) {
            throw new BadRequestException(isCredentialsExists)
        }
        const passwordHash = await this.authUtils._generateHash(dto.password)
        const code = uuidv4()
        const user = await this.usersRepository.createUser(dto.login, dto.email, passwordHash, code)
        const confirmUser = await this.usersRepository.confirmEmail(code)
        return {
            id:user.id.toString(),
            login: user.login,
            email: user.email,
            createdAt: user.createdAt
        }
    }

    async delete(id: string) {
        const user = await this.findById(id)

        return await this.usersRepository.delete(+id);
    }

    findAll(dto: CreateUserPaginatedDto): any {
        return this.usersRepository.getAll(dto)
    }

    async findById(id: string) {
        try {
            const user = await this.usersRepository.findById(id)
            if (!user) {
                throw new NotFoundException('net takogo uzerka')
            }
            return user
        } catch (e) {
            if (e.name == 'NotFoundException') {
                throw new NotFoundException('net takogo userka')
            } else throw new NotFoundException(e)
        }
    }

}