import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BanUnbanUserDto } from "../dto/BanUnbanUserDto";
import { Inject, NotFoundException } from "@nestjs/common";
import { IUsersRepo, IUsersRepoToken } from "../IUsersRepo";
import { UserEntity } from "../entity/user.entity";
import { IDevicesRepo, IDevicesRepoToken } from "../../device/IDevicesRepo";
import { DeviceEntity } from "../../device/entities/device.entity";

export class SA_BanUnbanUserCommand {
  constructor(
    public readonly dto: BanUnbanUserDto,
    public readonly userId: string,
  ) {}
}

@CommandHandler(SA_BanUnbanUserCommand)
export class BanUnbanUserHandler
  implements ICommandHandler<SA_BanUnbanUserCommand>
{
  constructor(
    @Inject(IUsersRepoToken)
    private readonly usersRepo: IUsersRepo<UserEntity>,
    @Inject(IDevicesRepoToken)
    private readonly devRepo: IDevicesRepo<DeviceEntity>,
  ) {}

  async execute(command: SA_BanUnbanUserCommand): Promise<any> {
    const { userId, dto } = command;
    const isUserIdExists = await this.usersRepo.findById(userId);
    if (!isUserIdExists) {
      throw new NotFoundException('net takogo uzer id');
    }
    await this.usersRepo.setBanStatus(userId, dto);
    //refresh tokens for all user's devices should be deleted.
    if (dto.isBanned) {
      const devices = await this.devRepo.getAllDevices(userId);
      for await (const device of devices) {
        await this.devRepo.deleteDeviceById(device.deviceId);
      }
    }
    return;
  }
}
