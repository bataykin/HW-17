import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { UserEntity } from "../users/entity/user.entity";
import { jwtConstants } from "./constants";
import { JwtService } from "@nestjs/jwt";
import { v4 as uuidv4 } from "uuid";

import bcrypt from "bcrypt";
import {
  IUsersQueryRepo,
  IUsersQueryRepoToken,
} from "../users/DAL/IUserQueryRepo";

@Injectable()
export class AuthService {
  constructor(
    @Inject(IUsersQueryRepoToken)
    private readonly usersQueryRepo: IUsersQueryRepo<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly logger: Logger,
  ) /*private readonly reftokensRepo: ReftokenORMRepo*/ {}

  async validateUser(username: string, password: string) {
    const user = await this.usersQueryRepo.findByLogin(username);
    if (!user) {
      throw new UnauthorizedException("netu takogo logina");
    }
    const isEqual = await bcrypt.compare(password, user["passwordHash"]);
    if (!isEqual) {
      throw new UnauthorizedException("parol ne podhodit");
    }
    return user;
  }

  async retrieveUser(refToken: string): Promise<any> {
    try {
      const user = await this.jwtService.verify(refToken, {
        secret: jwtConstants.secret,
      });
      if (!user) {
        throw new UnauthorizedException("token protyX");
      }
      return user;
    } catch (e) {
      throw new UnauthorizedException("TokenExpiredError: jwt expired");
    }
  }

  async refreshTokens(token: string, userId: string): Promise<any> {
    const userFromToken = await this.usersQueryRepo.findById(userId);
    if (!userFromToken) {
      throw new UnauthorizedException("user in token not found");
    }

    const newPayload = {
      username: userFromToken.login,
      sub: userId,

      deviceId: uuidv4(),
      title: "",
      ip: "",
      userId: "",
      issuedAt: new Date(),
    };
    const accToken = this.jwtService.sign(newPayload, {
      expiresIn: jwtConstants.accessTokenExpiresIn,
      secret: jwtConstants.secret,
    });
    const refToken = this.jwtService.sign(newPayload, {
      expiresIn: jwtConstants.refreshTokenExpiresIn,
      secret: jwtConstants.secret,
    });

    // await this.reftokensRepo.renewReftokenDB(refToken, token)

    return {
      accessToken: accToken,
      refreshToken: refToken,
    };
  }

  async getUserIdByToken(token: string): Promise<any> | null {
    try {
      const result: any = this.jwtService.verify(token);
      return result.userId;
    } catch (error: any) {
      error.message += "Token expired " + error.message;
      return null;
    }
  }

  async aboutMe(userId: string): Promise<any> {
    const detectedUser = await this.usersQueryRepo.findById(userId);
    const result = {
      email: detectedUser.email,
      login: detectedUser.login,
      userId: userId.toString(),
    };
    return result;
  }
}
