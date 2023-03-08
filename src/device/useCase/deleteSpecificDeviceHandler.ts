import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ForbiddenException, Inject, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { IDevicesRepo, IDevicesRepoToken } from "../IDevicesRepo";
import { DeviceEntity } from "../entities/device.entity";
import { jwtConstants } from "../../auth/constants";
import { JwtService } from "@nestjs/jwt";

export class DeleteSpecificDeviceCommand {
    constructor(public readonly deviceId: string,
                public readonly reftoken: string) {
    }
}

@CommandHandler(DeleteSpecificDeviceCommand)
export class DeleteSpecificDeviceHandler implements ICommandHandler<DeleteSpecificDeviceCommand> {
    constructor(@Inject(IDevicesRepoToken)
                private readonly devrepo: IDevicesRepo<DeviceEntity>,
                private readonly jwtService:JwtService,) {
    }

    async execute(command: DeleteSpecificDeviceCommand): Promise<any> {
        const {deviceId, reftoken} = command
        const device: DeviceEntity = await this.devrepo.getDeviceById(deviceId)
        if (!device) throw new NotFoundException('net takogo deviceID')
        try {
            const retrievedUser = await this.jwtService.verify(reftoken, {secret: jwtConstants.secret})
            if (!retrievedUser) {
                throw new UnauthorizedException('user protyX')
            }
            if (device.userId !== retrievedUser.userId) {
                throw new ForbiddenException('deviceId not belongs to you')
            }
            await this.devrepo.deleteDeviceById(deviceId)

        } catch (e) {
            // console.log(e)
            if (e.status == 403) {
                throw new ForbiddenException('deviceId not belongs to you')
            } else if (e.status == 404) {
                throw new NotFoundException('net takogo deviceID')
            } else {

                throw new UnauthorizedException('TokenExpiredError: jwt expired')
            }
        }
        // console.log(process.env)
        // console.log(jwtConstants.httpOnly)

        // await this.devrepo.deleteDeviceById(deviceId)
    }

}