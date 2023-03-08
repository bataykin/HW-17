import {BloggersMongoService} from "../bloggers/oldServicesRepos/bloggers.Mongo.service";
import {BloggersSQLService} from "../bloggers/oldServicesRepos/bloggers.SQL.service";
import {BloggersORMService} from "../bloggers/oldServicesRepos/bloggers.ORM.service";
import {ConfigService, registerAs} from "@nestjs/config";
import {TypeOrmModuleOptions} from "@nestjs/typeorm";
import {extend} from "joi";
import {ConfigType, getConfiguration} from "./configuration";
import {Inject} from "@nestjs/common";

let configService: ConfigService<ConfigType>


// export default registerAs('database', () => ({
//     host: process.env.DATABASE_HOST,
//     port: process.env.DATABASE_PORT || 5432
// }));



export const useConfigDB  = () => {
    if (process.env.REPO_TYPE === 'MONGO') {
        return configService.get('db.mongo',  { infer: true })
    } else if (process.env.REPO_TYPE === 'SQL') {
        return configService.get('db.sql',  { infer: true })
    } else if (process.env.REPO_TYPE === 'ORM') {
        return configService.get('db.orm',  { infer: true })
    } else return configService.get('db.orm',  { infer: true }) // by DEFAULT if not in enum
}