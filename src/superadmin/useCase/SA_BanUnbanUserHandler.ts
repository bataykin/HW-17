import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BanUserInputModel } from "../dto/BanUserInputModel";
import { Inject, NotFoundException } from "@nestjs/common";
import { IUsersRepo, IUsersRepoToken } from "../../users/DAL/IUsersRepo";
import { UserEntity } from "../../users/entity/user.entity";
import { IDevicesRepo, IDevicesRepoToken } from "../../device/IDevicesRepo";
import { DeviceEntity } from "../../device/entities/device.entity";
import {
  IUsersQueryRepo,
  IUsersQueryRepoToken,
} from "../../users/DAL/IUserQueryRepo";

export class SA_BanUnbanUserCommand {
  constructor(
    public readonly dto: BanUserInputModel,
    public readonly userId: string,
  ) {}
}

@CommandHandler(SA_BanUnbanUserCommand)
export class SA_BanUnbanUserHandler
  implements ICommandHandler<SA_BanUnbanUserCommand>
{
  constructor(
    @Inject(IUsersRepoToken)
    private readonly usersRepo: IUsersRepo<UserEntity>,
    @Inject(IUsersQueryRepoToken)
    private readonly usersQueryRepo: IUsersQueryRepo<UserEntity>,
    @Inject(IDevicesRepoToken)
    private readonly devRepo: IDevicesRepo<DeviceEntity>,
  ) {}

  async execute(command: SA_BanUnbanUserCommand): Promise<any> {
    const { userId, dto } = command;
    const isUserIdExists = await this.usersQueryRepo
      .findById(userId)
      .then((res) => res[0]);
    if (!isUserIdExists) {
      throw new NotFoundException("net takogo uzer id");
    }
    await this.usersRepo.setBanStatus(userId, dto);
    if (dto.isBanned) {
      const devices = await this.devRepo.getAllDevices(userId);
      for await (const device of devices) {
        await this.devRepo.deleteDeviceById(device.deviceId);
      }
    }
    return;
  }
}
