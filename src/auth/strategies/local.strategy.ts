import { Strategy } from "passport-local";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../authService";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private readonly logger: Logger,
  ) {
    super({
      usernameField: "loginOrEmail",
    });
  }

  async validate(username: string, password: string): Promise<any> {
    console.log(username, password);
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException("net takogo usera");
    }
    return user;
  }
}
