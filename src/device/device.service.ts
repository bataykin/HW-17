import { Injectable } from "@nestjs/common";


@Injectable()
export class DeviceService {


  findAll() {
    return `This action returns all device`;
  }

  removeAll() {
    return `This action removes all devices`;
  }

  remove(id: number) {
    return `This action removes a #${id} device`;
  }
}
