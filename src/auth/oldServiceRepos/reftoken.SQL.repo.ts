import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";
import {addSeconds} from "date-fns";
import {jwtConstants} from "../constants";

@Injectable()
export class ReftokenSQLRepo {
    constructor(private readonly dataSource: DataSource) {
    }

    async addReftokenDB(reftoken: string) {
        // await this.refreshTokenModel.insertMany({
        //     token: refToken,
        //     isValid: true,
        //     expiresAt: addSeconds(new Date(), 20),
        // })
        const insertRefToken = await this.dataSource.query(`
                INSERT INTO reftokens
                (token, "isValid", "expiresAt")
                VALUES ($1, $2, $3)
                RETURNING *
                    `, [reftoken, true, addSeconds(new Date(), Number(jwtConstants.refreshTokenExpiresIn))])
    }

    async renewReftokenDB(refToken: string, oldToken: string) {
        // // sign old token as invalid in DB
        const revokeOldToken = await this.dataSource.query(`
            UPDATE reftokens
                SET "replacedBy" = $1, "isValid" = $2
                WHERE token = $3
                RETURNING *
            `, [refToken, false, oldToken])

        // // create new DB record for new token
        const recordNewToken = await this.addReftokenDB(refToken)
        return true

    }

    async revokeTokenLogout(refToken: any) {
        // await this.refreshTokenModel.findOneAndUpdate(
        //     {token: refToken},
        //     {isValid: false, replacedBy: 'logout'})
        const revokeToken = await this.dataSource.query(`
            UPDATE reftokens
                SET "isValid" = $1
                WHERE token = $2
                RETURNING *
            `, [false, refToken])
        return revokeToken
    }

    async getTokenFromDB(token: string) {
        const existedToken = await this.dataSource.query(`
                SELECT *
                FROM reftokens 
                WHERE token = $1
        `, [token])
        return existedToken
    }
}