import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { IDevicesRepo, IDevicesRepoToken } from "../IDevicesRepo";
import { DeviceEntity } from "../entities/device.entity";
import { Inject, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { jwtConstants } from "../../auth/constants";
import { JWTPayloadDto } from "../../auth/dto/JWTPayloadDto";

export class GetAllDevicesCommand {
    constructor(public readonly refreshToken: string) {
    }
}

@QueryHandler(GetAllDevicesCommand)
export class GetAllDevicesHandler implements IQueryHandler<GetAllDevicesCommand> {
    constructor(@Inject(IDevicesRepoToken)
                private readonly devRepo: IDevicesRepo<DeviceEntity>,
                private readonly jwtService: JwtService
    ) {

    }

    async execute(query: GetAllDevicesCommand): Promise<any> {
        const {refreshToken} = query
        let extractedPayload: JWTPayloadDto
        try {
            extractedPayload = await this.jwtService.verify(refreshToken, {secret: jwtConstants.secret})
            if (!extractedPayload || !extractedPayload.userId) throw new UnauthorizedException('user protyX')
        } catch (e) {
            throw new UnauthorizedException('TokenExpiredError: jwt expired')
        }
        const devs: DeviceEntity[] = await this.devRepo.getAllDevices(extractedPayload.userId)
        return devs.map(({id, userId, issuedAt, loggedOut, ...rest}) => rest)
    }
}

