import {JWTPayloadDto} from "../auth/dto/JWTPayloadDto";
import {DeviceEntity} from "./entities/device.entity";

export const IDevicesRepoToken = Symbol('IDevicesRepoToken')

export interface IDevicesRepo<GenericDeviceType>
{
    addNewDevice(payload: JWTPayloadDto):Promise<GenericDeviceType>

    deleteAllDevices(userId: string, deviceId: string)

    deleteDeviceById(deviceId: string)

    getAllDevices(userId: string): Promise<DeviceEntity[] | null>

    checkDeviceByUser(deviceId: string, userId: string)

    getDeviceById(deviceId: string)

    updateActiveDateByDeviceId(deviceId: string)

    revokeToken(device: DeviceEntity)


    logoutDevice(deviceId: string)

    getDeviceByTitleAndIp(userId: string, devName: string, ip: string)
}