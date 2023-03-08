import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { AuthUtilsClass } from "../auth/auth.utils";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./entity/user.entity";
import { useRepositoryClassGeneric } from "../common/useRepositoryClassGeneric";
import { IUsersRepoToken } from "./IUsersRepo";
import { UsersORM } from "./users.ORM";
import { CqrsModule } from "@nestjs/cqrs";
import { CreateUserHandler } from "./useCase/createUserHandler";
import { GetUsersHandler } from "./useCase/getUsersHandler";
import { DeleteUserHandler } from "./useCase/deleteUserHandler";
import { BanUnbanUserHandler } from "./useCase/banUnbanUserHandler";
import { IDevicesRepoToken } from "../device/IDevicesRepo";
import { DevicesORM } from "../device/devices.ORM";
import { DeviceEntity } from "../device/entities/device.entity";

const usersRouteHandlers = [
  CreateUserHandler,
  GetUsersHandler,
  DeleteUserHandler,
  BanUnbanUserHandler,
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([UserEntity, DeviceEntity]),

    // MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],

  controllers: [UsersController],

  providers: [
    ...usersRouteHandlers,
    AuthUtilsClass,

    {
      provide: IUsersRepoToken,
      useClass: useRepositoryClassGeneric(UsersORM, UsersORM, UsersORM),
    },
    {
      provide: IDevicesRepoToken,
      useClass: useRepositoryClassGeneric(DevicesORM, DevicesORM, DevicesORM),
    },

    // {
    //     provide: AUserService,
    //     useClass: useUserServiceClass()
    // },
    //
    // UsersORMService,
    // UsersORMRepo,
    //
    // UsersSQLService,
    // UsersSQLRepo,
    //
    //
    // UsersMongoService,
    // {
    //     provide: UsersMongoRepo,
    //     useClass: UsersMongoRepo
    // },
    // UsersMongoRepo,
    // {
    //     provide: getModelToken(User.name),
    //     useValue: userModel,
    // },
  ],
  exports: [
    // UsersMongoRepo,
    // UsersSQLService,
    // UsersSQLRepo,
    //
    // UsersORMService,
    // UsersORMRepo,
    // TypeOrmModule
  ],
})
export class UsersModule {}
