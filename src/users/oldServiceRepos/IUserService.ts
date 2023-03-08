import { CreateUserPaginatedDto } from "../dto/create.user.paginated.dto";
import { CreateUserDto } from "../dto/create.user.dto";

export interface IUserService {
  findAll(dto: CreateUserPaginatedDto): any;

  create(dto: CreateUserDto): any;

  delete(id: string): any;

  findById(id: string): any;
}

export const IUserServiceToken = Symbol("IUserService");

export abstract class AUserService {
  abstract findAll(dto: CreateUserPaginatedDto): any;

  abstract create(dto: CreateUserDto): any;

  abstract delete(id: string): any;

  abstract findById(id: string): any;
}
