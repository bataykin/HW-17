import { Repository } from "typeorm";
import { DeviceEntity } from "./entities/device.entity";
import { IDevicesRepo } from "./IDevicesRepo";
import { InjectRepository } from "@nestjs/typeorm";
import { JWTPayloadDto } from "../auth/dto/JWTPayloadDto";

export class DevicesORM
  extends Repository<DeviceEntity>
  implements IDevicesRepo<DeviceEntity>
{
  constructor(
    @InjectRepository(DeviceEntity)
    private readonly devicesRepo: Repository<DeviceEntity>,
  ) {
    super(DeviceEntity, devicesRepo.manager, devicesRepo.queryRunner);
  }

  async logoutDevice(deviceId: string) {
    await this.devicesRepo.update({ deviceId: deviceId }, { loggedOut: true });
  }

  async updateActiveDateByDeviceId(deviceId: string) {
    const renewedToken = await this.devicesRepo.update(
      { deviceId: deviceId },
      { lastActiveDate: new Date() },
    );
    return renewedToken;
  }

  async addNewDevice(payload: JWTPayloadDto): Promise<DeviceEntity> {
    const newDevice = new DeviceEntity();
    newDevice.issuedAt = payload.issuedAt;
    newDevice.deviceId = payload.deviceId;
    newDevice.ip = payload.ip;
    newDevice.title = payload.title;
    newDevice.userId = payload.userId;
    newDevice.lastActiveDate = new Date();
    newDevice.loggedOut = false;
    // newDevice.lastActiveDate = payload.issuedAt
    await this.devicesRepo.manager.save(newDevice);
    return newDevice;
  }

  async deleteAllDevices(userId: string, deviceId: string) {
    return await this.devicesRepo
      .createQueryBuilder('devices')
      .delete()
      .from(DeviceEntity)
      .where('userId = :userId', { userId: userId })
      .andWhere('deviceId != :deviceId', { deviceId: deviceId })
      .execute();
    // return await this.devicesRepo.delete({userId: userId, deviceId}, )
  }

  async deleteDeviceById(deviceId: string) {
    return await this.devicesRepo.delete({ deviceId: deviceId });
  }

  checkDeviceByUser(deviceId: string, userId: string) {}

  async getAllDevices(userId: string) {
    // console.log("userId : ", userId)
    const devs = await this.devicesRepo.findBy({
      userId: userId,
      loggedOut: false,
    });
    // if (!devs) return null
    // console.log(devs)
    return devs;
  }

  async getDeviceById(deviceId: string) {
    return this.devicesRepo.findOneBy({ deviceId });
  }

  async revokeToken(device: DeviceEntity) {
    // console.log(issuedAt)
    const oldToken = await this.devicesRepo.findOneBy({ id: device.id });
    const newDevice = new DeviceEntity();
    newDevice.deviceId = oldToken.deviceId;
    newDevice.ip = oldToken.ip;
    newDevice.title = oldToken.title;
    newDevice.userId = oldToken.userId;
    newDevice.lastActiveDate = new Date();
    newDevice.loggedOut = false;
    const newToken = await this.devicesRepo.manager.save(newDevice);
    console.log(oldToken.id);
    await this.devicesRepo.delete({ id: oldToken.id });
    return newDevice;
  }

  async getDeviceByTitleAndIp(
    userId: string,
    devName: string,
    ip: string,
  ): Promise<DeviceEntity | null> {
    return await this.devicesRepo.findOneBy({
      userId: userId,
      title: devName,
      ip: ip,
    });
  }
}
