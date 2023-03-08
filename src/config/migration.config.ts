import { DataSource } from 'typeorm';

const datasource = new DataSource({
  // datastore: 'postgresql-rugged-65282',
  type: 'postgres',
  host: 'ec2-52-210-97-223.eu-west-1.compute.amazonaws.com',
  port: 5432,
  username: 'rbjeykyskeeema',
  password: 'cbd9dab3c624ca31d01ee08bc004f5d5f265ceadf5f4132ba97bdb133e653565',
  database: 'd2b54pjsi4gkji',
  ssl: {
    rejectUnauthorized: false,
  },
  // autoLoadEntities: true,
  synchronize: true,
  // entities: [UserEntity],
  entities: [__dirname + '/../**/entities/*.{ts,js}'],
  logging: false,

  migrations: [
    /*...*/
  ],
}); // config is one that is defined in datasource.config.ts file
datasource.initialize();
export default datasource;
