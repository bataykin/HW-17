import { Injectable } from '@nestjs/common';
import { UserDocument } from '../../users/user.schema';
import { Model, Types } from 'mongoose';
import { addSeconds } from 'date-fns';
import { InjectModel } from '@nestjs/mongoose';
import { RefreshToken, RefreshTokenDocument } from './refresh.token.schema';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtServiceClass {
  constructor(
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>,
    private readonly jwtService: JwtService,
  ) {}

  createJWTAccessToken(user: UserDocument) {
    const accessToken = this.jwtService.sign(
      { userId: user._id },
      { expiresIn: 10 },
    );
    // return jws.sign({header: header, payload: payload, secret: secretOrPrivateKey, encoding: encoding});

    // const accessToken = jwt.sign({},{})
    return accessToken;
  }

  async getUserIdByToken(token: string): Promise<Types.ObjectId> | null {
    try {
      const result: any = this.jwtService.verify(token);
      return result.userId;
    } catch (error: any) {
      error.message += 'Token expired ' + error.message;
      return null;
    }
  }

  async createJWTRefreshToken(user: UserDocument) {
    const refreshToken = this.jwtService.sign(
      { userId: user._id },
      { expiresIn: 20 },
    );
    return refreshToken;
  }

  async createRTokenDB(token: string) {
    await this.refreshTokenModel.insertMany({
      token: token,
      isValid: true,
      expiresIn: addSeconds(new Date(), 20),
    });
  }
}
