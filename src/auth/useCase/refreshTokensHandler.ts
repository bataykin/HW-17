import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { jwtConstants } from "../constants";
import { Inject, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { JWTPayloadDto } from "../dto/JWTPayloadDto";
import { IDevicesRepo, IDevicesRepoToken } from "../../device/IDevicesRepo";
import { DeviceEntity } from "../../device/entities/device.entity";

export class RefreshTokensCommand {
  constructor(
    public readonly reftoken: any,
    public readonly title: string,
    public readonly ip: string,
  ) {}
}

@CommandHandler(RefreshTokensCommand)
export class RefreshTokensHandler
  implements ICommandHandler<RefreshTokensCommand>
{
  constructor(
    @Inject(IDevicesRepoToken)
    private readonly devRepo: IDevicesRepo<DeviceEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: RefreshTokensCommand): Promise<any> {
    const { reftoken, ip, title } = command;
    let extractedPayload: any;
    try {
      extractedPayload = await this.jwtService.verify(reftoken, {
        secret: jwtConstants.secret,
      });
      if (!extractedPayload) throw new UnauthorizedException("user protyX");
    } catch (e) {
      throw new UnauthorizedException(e);
    }

    const extractedDevice: DeviceEntity = await this.devRepo.getDeviceById(
      extractedPayload.deviceId,
    );
    if (!extractedDevice) throw new UnauthorizedException("device not found");
    if (extractedDevice.loggedOut)
      throw new UnauthorizedException("device loggedOut or revoked token");
    // console.log('deviceTitleDB: ', extractedDevice.title, " devTitleRequest:  ", title)
    // console.log('deviceIPDB: ', extractedDevice.ip, " devIPRequest:  ", ip)
    if (/*extractedDevice.title !== title ||*/ extractedDevice.ip !== ip)
      throw new UnauthorizedException(
        "wrong digital fingerprint, relogin please",
      );
    // console.log(extractedPayload.sessionId , extractedDevice.id)
    if (extractedPayload.sessionId !== extractedDevice.id)
      throw new UnauthorizedException("reftoken revoked");
    const newToken = await this.devRepo.revokeToken(extractedDevice);
    await this.devRepo.updateActiveDateByDeviceId(extractedDevice.deviceId);
    const payload: JWTPayloadDto = {
      username: extractedPayload.username,
      sub: extractedDevice.userId,

      deviceId: extractedDevice.deviceId,
      title: title,
      ip: ip,
      userId: extractedDevice.userId,
      issuedAt: new Date(),
      sessionId: newToken.id,
    };
    const accToken = this.jwtService.sign(payload, {
      expiresIn: jwtConstants.accessTokenExpiresIn,
      secret: jwtConstants.secret,
    });
    const newRefToken = this.jwtService.sign(payload, {
      expiresIn: jwtConstants.refreshTokenExpiresIn,
      secret: jwtConstants.secret,
    });
    return {
      accessToken: accToken,
      refreshToken: newRefToken,
    };
  }
}
