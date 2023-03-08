// import {PostgresConnectionOptions} from "typeorm/driver/postgres/PostgresConnectionOptions";
// import {BloggerEntity} from "../bloggers/entities/blogger.entity";
// import {DataSource} from "typeorm";
// import {config} from "dotenv";
//
// config()
//
// const isTest = process.env.NODE_ENV === 'test';
// // const isTest = true;
//
// console.log("DIR", __dirname)
//
// export const postgresConnectionOptions: PostgresConnectionOptions = {
//     name: "default",
//     type: 'postgres',
//     host: process.env[isTest ? 'PG_TEST_HOST' : 'PG_HOST'],
//     port: +process.env[isTest ? 'PG_TEST_PORT' : 'PG_PORT'],
//     username: process.env[isTest ? 'PG_TEST_USER' : 'PG_USER'],
//     password: process.env[isTest ? 'PG_TEST_PASSWORD' : 'PG_PASSWORD'],
//     database: process.env[isTest ? 'DB_TEST_NAME' : 'DB_NAME'],
//     entities: [
//         BloggerEntity
//     ],
//     synchronize: false,
//     logging: false,
//     migrations: [__dirname + '/infra/postgres/migrations/**/*{.ts,.js}'],
// };
//
//
// export default new DataSource(postgresConnectionOptions)
