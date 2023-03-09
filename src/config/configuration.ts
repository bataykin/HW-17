import * as process from "process";

export const getConfiguration = () => {
  // Hello: this.appService.getHello(),
  return {
    ENV: process.env.NODE_ENV,
    DB_TYPE: process.env.REPO_TYPE,
    POSTGRES_HOST: process.env.POSTGRES_HOST,

    db: {
      sql: {
        // datastore: 'postgresql-perpendicular-36302',
        type: "postgres",
        host: process.env.POSTGRES_HOST,
        port: 5432,
        username: "vdyfkubfmsrxvz",
        password:
          "e4bb6634bdfef17111b8c12b344ae2d387a533843b72797c26e5c6e1833d3c01",
        database: "d38j5ds5ohlp9r",
        ssl: {
          rejectUnauthorized: false,
        },
        autoLoadEntities: true,
        synchronize: true,
        entities: [],
        logging: ["error"],

        migrations: [
          /*...*/
        ],
      },
    },
  };
};

export type ConfigType = ReturnType<typeof getConfiguration> & {
  REPO_TYPE: string;
  NODE_ENV: "production" | "development" | "testing";
};
