import { Module } from "@nestjs/common";
import { DeviceService } from "./device.service";
import { DeviceController } from "./device.controller";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DeviceEntity } from "./entities/device.entity";
import { DevicesORM } from "./devices.ORM";
import { IDevicesRepoToken } from "./IDevicesRepo";
import { useRepositoryClassGeneric } from "../common/useRepositoryClassGeneric";
import { GetAllDevicesHandler } from "./useCase/getAllDevicesCommand";
import { JwtService } from "@nestjs/jwt";
import { DeleteAllDevicesHandler } from "./useCase/deleteAllDevicesHandler";
import { DeleteSpecificDeviceHandler } from "./useCase/deleteSpecificDeviceHandler";

const deviceRouteHandlers = [
    GetAllDevicesHandler,
    DeleteAllDevicesHandler,
    DeleteSpecificDeviceHandler
]

@Module({
  imports:[
      CqrsModule,
      TypeOrmModule.forFeature([DeviceEntity]),

  ],
  controllers: [DeviceController],
  providers: [
      ...deviceRouteHandlers,
      DeviceService,
      DevicesORM,
      {
          provide: IDevicesRepoToken,
          useClass: useRepositoryClassGeneric(DevicesORM, DevicesORM, DevicesORM)
      },

      JwtService

  ],
    exports:[]
})
export class DeviceModule {}
