import { ConfigModule } from "@nestjs/config";
import { getConfiguration } from "./configuration";

const environment = process.env.NODE_ENV || "development";

export const configModule = ConfigModule.forRoot({
  envFilePath: [`.env.${environment}`, ".env.local", ".env"],
  isGlobal: true,
  ignoreEnvFile: false,
  load: [getConfiguration],
  validationOptions: {
    allowUnknown: true,
  },
  expandVariables: true,
});
