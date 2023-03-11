import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject, UnauthorizedException } from "@nestjs/common";
import { IDevicesRepo, IDevicesRepoToken } from "../IDevicesRepo";
import { DeviceEntity } from "../entities/device.entity";
import { jwtConstants } from "../../auth/constants";
import { JwtService } from "@nestjs/jwt";

export class DeleteAllDevicesCommand {
  constructor(public readonly refreshToken: string) {}
}

@CommandHandler(DeleteAllDevicesCommand)
export class DeleteAllDevicesHandler
  implements ICommandHandler<DeleteAllDevicesCommand>
{
  constructor(
    @Inject(IDevicesRepoToken)
    private readonly devRepo: IDevicesRepo<DeviceEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: DeleteAllDevicesCommand): Promise<any> {
    const { refreshToken } = command;
    try {
      const retrievedUser = await this.jwtService.verify(refreshToken, {
        secret: jwtConstants.secret,
      });
      if (!retrievedUser) {
        throw new UnauthorizedException("user protyX");
      } else {
        await this.devRepo.deleteAllDevices(
          retrievedUser.userId,
          retrievedUser.deviceId,
        );
      }
    } catch (e) {
      // console.log(e)
      throw new UnauthorizedException("TokenExpiredError: jwt expired");
    }
    return Promise.resolve(undefined);
  }
}
