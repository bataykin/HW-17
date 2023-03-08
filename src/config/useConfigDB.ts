import { ConfigService } from "@nestjs/config";
import { ConfigType } from "./configuration";

let configService: ConfigService<ConfigType>;

// export default registerAs('database', () => ({
//     host: process.env.DATABASE_HOST,
//     port: process.env.DATABASE_PORT || 5432
// }));

export const useConfigDB = () => {
  if (process.env.REPO_TYPE === "MONGO") {
    return configService.get("db.mongo", { infer: true });
  } else if (process.env.REPO_TYPE === "SQL") {
    return configService.get("db.sql", { infer: true });
  } else if (process.env.REPO_TYPE === "ORM") {
    return configService.get("db.orm", { infer: true });
  } else return configService.get("db.orm", { infer: true }); // by DEFAULT if not in enum
};
