import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {LikeEntity} from "../../likes/entities/like.entity";
import {Repository} from "typeorm";
import {ReftokenEntity} from "../entities/reftoken.entity";
import {addSeconds} from "date-fns";
import {jwtConstants} from "../constants";

@Injectable()
export class ReftokenORMRepo {
    constructor(@InjectRepository(ReftokenEntity)
                private readonly reftokensRepository: Repository<ReftokenEntity>,
    ) {
    }

    async addReftokenDB(refToken: string) {
        const res =  await this.reftokensRepository.insert({
            token: refToken,
            isValid: true,
            expiresAt: addSeconds(new Date(), Number(jwtConstants.refreshTokenExpiresIn))
        })
        return res
    }

    async revokeTokenLogout(refToken: any) {
        return await this.reftokensRepository.update(
            {token: refToken},
            {
                isValid: false,
                replacedBy: 'logout'
            }
        )
    }

    async getTokenFromDB(token: string) {
        return await this.reftokensRepository.findOneBy({token: token})
    }

    async renewReftokenDB(refToken: string, oldToken: string) {
        await this.reftokensRepository.update(
            {token: oldToken},
            {
                replacedBy: refToken,
                isValid: false
            }
        )

        const recordNewToken = await this.addReftokenDB(refToken)
        return recordNewToken
    }
}