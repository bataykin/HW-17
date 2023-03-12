import { Module } from "@nestjs/common";
import { SuperAdminController } from "./superAdminController";
import { CqrsModule } from "@nestjs/cqrs";
import { IBlogsRepoToken } from "../bloggers/DAL/IBlogsRepo";
import { useRepositoryClassGeneric } from "../common/useRepositoryClassGeneric";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BlogEntity } from "../bloggers/entities/blogEntity";
import { UserEntity } from "../users/entity/user.entity";
import { SA_CreateUserHandler } from "./useCase/SA_CreateUserHandler";
import { SA_DeleteUserHandler } from "./useCase/SA_DeleteUserHandler";
import { SA_BanUnbanUserHandler } from "./useCase/SA_BanUnbanUserHandler";
import { SA_GetUsersHandler } from "./useCase/SA_GetUsersHandler";
import { IUsersRepoToken } from "../users/DAL/IUsersRepo";
import { IUsersQueryRepoToken } from "../users/DAL/IUserQueryRepo";
import { AuthHashClass } from "../auth/auth.utils";
import { IDevicesRepoToken } from "../device/IDevicesRepo";
import { DevicesORM } from "../device/devices.ORM";
import { DeviceEntity } from "../device/entities/device.entity";
import { UsersSQLRepo } from "../users/DAL/users.SQL.repo";
import { UsersSQLQueryRepo } from "../users/DAL/users.SQL.QueryRepo";
import { BloggersSQLRepo } from "../bloggers/DAL/bloggers.SQL.repo";
import { SA_GetBlogsHandler } from "./useCase/SA_GetBlogsHandler";

const saRouteHandlers = [
  SA_CreateUserHandler,
  SA_DeleteUserHandler,
  SA_BanUnbanUserHandler,
  SA_GetUsersHandler,

  SA_GetBlogsHandler,
];
@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([BlogEntity, UserEntity, DeviceEntity]),
  ],
  controllers: [SuperAdminController],
  providers: [
    ...saRouteHandlers,
    {
      provide: IUsersRepoToken,
      useClass: UsersSQLRepo,
    },
    {
      provide: IUsersQueryRepoToken,
      useClass: UsersSQLQueryRepo,
    },
    {
      provide: IBlogsRepoToken,
      useClass: BloggersSQLRepo,
    },
    {
      provide: IDevicesRepoToken,
      useClass: useRepositoryClassGeneric(DevicesORM, DevicesORM, DevicesORM),
    },
    AuthHashClass,
  ],
  exports: [],
})
export class SuperAdminModule {}
