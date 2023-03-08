import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {AuthService} from "../authService";
import {ForbiddenException, Inject, UnauthorizedException} from "@nestjs/common";
import {jwtConstants} from "../constants";
import {JwtService} from "@nestjs/jwt";
import {IDevicesRepo, IDevicesRepoToken} from "../../device/IDevicesRepo";
import {DeviceEntity} from "../../device/entities/device.entity";
import {JWTPayloadDto} from "../dto/JWTPayloadDto";

export class LogoutCommand {
    constructor(public readonly reftoken: any) {
    }
}


@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
    constructor(@Inject(IDevicesRepoToken)
                private readonly devRepo: IDevicesRepo<DeviceEntity>,
                private readonly authService: AuthService,
                private readonly jwtService: JwtService,) {
    }

    async execute(command: LogoutCommand): Promise<any> {
        const {reftoken} = command
        let extractedPayload: JWTPayloadDto
        try {
            extractedPayload = await this.jwtService.verify(reftoken, {secret: jwtConstants.secret})
            if (!extractedPayload) throw new UnauthorizedException('user protyX')
        } catch (e) {
            throw new UnauthorizedException(e)
        }
        const extractedDevice: DeviceEntity = await this.devRepo.getDeviceById(extractedPayload.deviceId)
        if (!extractedDevice) throw new UnauthorizedException('device not found')
        if (extractedDevice.loggedOut) throw  new UnauthorizedException('device already loggedOut')
        if (extractedPayload.sessionId !== extractedDevice.id) throw new UnauthorizedException('reftoken revoked')
        await this.devRepo.logoutDevice(extractedPayload.deviceId)
    }
}