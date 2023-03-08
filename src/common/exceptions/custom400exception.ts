import { BadRequestException } from "@nestjs/common";

export class Custom400exception extends BadRequestException {
  constructor(message: string, field: string) {
    super({ message: message, field: field });
  }
}
