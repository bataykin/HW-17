import { Injectable } from "@nestjs/common";
import { ConfigType } from "./config/configuration";
import { ConfigService } from "@nestjs/config";
import { AuthConfigType } from "./auth/configuration/authConfiguration";

@Injectable()
export class AppService {
  constructor(
    private configService: ConfigService<ConfigType>,
    private authConfigService: ConfigService<AuthConfigType>,
  ) {}

  getHello(): any {
    // console.log(this.configService.get<string>('POSTGRES_HOST'));
    // console.dir(this.configService.get('db', {infer: true}).mongo)
    return "Hello World!";

    // {
    //     repoType: this.configService.get<string>('REPO_TYPE'),
    //     auth: this.authConfigService.get<AuthConfigType>('authorization'),
    //     repoSettings: this.configService.get<any>('db')
    // };
  }
}
