import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Request,
} from "@nestjs/common";

import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { GetAllDevicesCommand } from "./useCase/getAllDevicesCommand";
import { DeleteAllDevicesCommand } from "./useCase/deleteAllDevicesHandler";
import { DeleteSpecificDeviceCommand } from "./useCase/deleteSpecificDeviceHandler";
import { SkipThrottle } from "@nestjs/throttler";

@SkipThrottle()
@Controller("security/devices")
export class DeviceController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  findAll(@Request() req) {
    return this.queryBus.execute(
      new GetAllDevicesCommand(req.cookies.refreshToken),
    );
    // return this.queryBus.execute()
  }

  @HttpCode(204)
  @Delete()
  removeAll(@Request() req) {
    return this.commandBus.execute(
      new DeleteAllDevicesCommand(req.cookies.refreshToken),
    );
  }

  @HttpCode(204)
  @Delete(":deviceId")
  remove(
    @Param(
      "deviceId",
      new ParseUUIDPipe({
        version: "4",
        errorHttpStatusCode: HttpStatus.NOT_FOUND,
      }),
    )
    deviceId: string,
    @Request() req,
  ) {
    return this.commandBus.execute(
      new DeleteSpecificDeviceCommand(deviceId, req.cookies.refreshToken),
    );
    // return this.deviceService.remove(+id);
  }
}
