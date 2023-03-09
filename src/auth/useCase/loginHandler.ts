import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { jwtConstants } from "../constants";
import { UserEntity } from "../../users/entity/user.entity";
import { JwtService } from "@nestjs/jwt";
import { IDevicesRepo, IDevicesRepoToken } from "../../device/IDevicesRepo";
import { DeviceEntity } from "../../device/entities/device.entity";
import { v4 as uuidv4 } from "uuid";
import { JWTPayloadDto } from "../dto/JWTPayloadDto";
import { IUsersRepo, IUsersRepoToken } from "../../users/DAL/IUsersRepo";
import { AuthHashClass } from "../auth.utils";

export class LoginCommand {
  constructor(
    public readonly user: UserEntity,
    public readonly devName: string,
    public readonly ip: string,
  ) {}
}

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    @Inject(IDevicesRepoToken)
    private readonly devicesRepo: IDevicesRepo<DeviceEntity>,
    @Inject(IUsersRepoToken)
    private readonly usersRepo: IUsersRepo<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly authUtils: AuthHashClass,
  ) {}

  async execute(command: LoginCommand): Promise<any> {
    const { user, devName, ip } = command;
    let payload: JWTPayloadDto;
    const prePayLoad: any = {
      username: user.login,
      sub: user.id,
      // deviceId:  uuidv4(),
      title: devName,
      ip: ip,
      userId: user.id,
      // issuedAt: new Date(),
    };
    const deviceExisted = await this.devicesRepo.getDeviceByTitleAndIp(
      user.id,
      devName,
      ip,
    );
    if (!deviceExisted) {
      payload = {
        ...prePayLoad,
        deviceId: uuidv4(),
        issuedAt: new Date(),
      };
      const device = await this.devicesRepo.addNewDevice(payload);
      // console.log(device)
      payload = { ...payload, sessionId: device.id };
    } else {
      payload = {
        ...prePayLoad,
        deviceId: deviceExisted.deviceId,
        issuedAt: new Date(),
        sessionId: deviceExisted.id,
      };
      await this.devicesRepo.updateActiveDateByDeviceId(deviceExisted.deviceId);
    }
    const accToken = this.jwtService.sign(payload, {
      expiresIn: jwtConstants.accessTokenExpiresIn,
      secret: jwtConstants.secret,
    });
    const refToken = this.jwtService.sign(payload, {
      expiresIn: jwtConstants.refreshTokenExpiresIn,
      secret: jwtConstants.secret,
    });
    return {
      accessToken: accToken,
      refreshToken: refToken,
    };
  }
}
