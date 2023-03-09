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
        username: "pcczftgtqzmswy",
        password:
          "649ce68a3f44da48fc46b6f4140394500ff4b5c14ae7554ccd10a2134300fd25",
        database: "d5h25idgo0jfol",
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
