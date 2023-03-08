//
// import { DataSource } from 'typeorm';
// import {ConfigService} from "@nestjs/config";
//
// export const databaseProviders = [
//     {
//         provide: 'DATA_SOURCE',
//         useFactory: async (config: ConfigService) => {
//             const dataSource = new DataSource( process.env.REPO_TYPE === "SQL" ? config.get('db.sql') : config.get('db.orm'),);
//
//             return dataSource.initialize();
//         },
//     },
// ];
