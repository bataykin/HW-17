import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { AuthHashClass } from "../auth/auth.utils";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./entity/user.entity";
import { useRepositoryClassGeneric } from "../common/useRepositoryClassGeneric";
import { IUsersRepoToken } from "./DAL/IUsersRepo";
import { CqrsModule } from "@nestjs/cqrs";
import { SA_CreateUserHandler } from "../superadmin/useCase/SA_CreateUserHandler";
import { SA_GetUsersHandler } from "../superadmin/useCase/SA_GetUsersHandler";
import { SA_DeleteUserHandler } from "../superadmin/useCase/SA_DeleteUserHandler";
import { SA_BanUnbanUserHandler } from "../superadmin/useCase/SA_BanUnbanUserHandler";
import { IDevicesRepoToken } from "../device/IDevicesRepo";
import { DevicesORM } from "../device/devices.ORM";
import { DeviceEntity } from "../device/entities/device.entity";
import { IUsersQueryRepoToken } from "./DAL/IUserQueryRepo";
import { UsersSQLRepo } from "./DAL/users.SQL.repo";
import { UsersSQLQueryRepo } from "./DAL/users.SQL.QueryRepo";

const usersRouteHandlers = [
  SA_CreateUserHandler,
  SA_GetUsersHandler,
  SA_DeleteUserHandler,
  SA_BanUnbanUserHandler,
];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([UserEntity, DeviceEntity])],

  controllers: [UsersController],

  providers: [
    ...usersRouteHandlers,
    AuthHashClass,

    {
      provide: IUsersRepoToken,
      useClass: UsersSQLRepo,
    },
    {
      provide: IUsersQueryRepoToken,
      useClass: UsersSQLQueryRepo,
    },
    {
      provide: IDevicesRepoToken,
      useClass: useRepositoryClassGeneric(DevicesORM, DevicesORM, DevicesORM),
    },
  ],
  exports: [],
})
export class UsersModule {}
