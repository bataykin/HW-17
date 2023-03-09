import { Logger, MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthHashClass } from "./auth.utils";
import { EmailService } from "../common/email/email.service";
import { UsersModule } from "../users/users.module";
import { APP_GUARD } from "@nestjs/core";
import { EmailsModule } from "../common/email/emails.module";
import { LoggerMiddleware } from "../middlewares/logger.middleware";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { LocalStrategy } from "./strategies/local.strategy";
import { jwtConstants } from "./constants";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { ConfigModule } from "@nestjs/config";
import { getAuthConfiguration } from "./configuration/authConfiguration";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "../users/entity/user.entity";
import { ReftokenEntity } from "./entities/reftoken.entity";
import { AuthService } from "./authService";
import { CqrsModule } from "@nestjs/cqrs";
import { ConfirmRegistrationHandler } from "./useCase/confirmRegistrationHandler";
import { IUsersRepoToken } from "../users/DAL/IUsersRepo";
import { useRepositoryClassGeneric } from "../common/useRepositoryClassGeneric";
import { RegistrationUserHandler } from "./useCase/registrationUserHandler";
import { ResendRegistrationEmailHandler } from "./useCase/resendRegistrationEmailHandler";
import { LoginHandler } from "./useCase/loginHandler";
import { RefreshTokensHandler } from "./useCase/refreshTokensHandler";
import { LogoutHandler } from "./useCase/logoutHandler";
import { AboutMeHandler } from "./useCase/aboutMeHandler";
import { IDevicesRepoToken } from "../device/IDevicesRepo";
import { DevicesORM } from "../device/devices.ORM";
import { DeviceModule } from "../device/device.module";
import { DeviceEntity } from "../device/entities/device.entity";
import { IRequestRepoToken } from "./IRequestRepo";
import { RequestORM } from "./request.ORM";
import { RequestEntity } from "./entities/request.entity";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { PasswordRecoveryHandler } from "./useCase/passwordRecoveryHandler";
import { RenewPasswordHandler } from "./useCase/renewPasswordHandler";
import { IUsersQueryRepoToken } from "../users/DAL/IUserQueryRepo";
import { UsersSQLRepo } from "../users/DAL/users.SQL.repo";
import { UsersSQLQueryRepo } from "../users/DAL/users.SQL.QueryRepo";
import { ReftokenSQLRepo } from "./oldServiceRepos/reftoken.SQL.repo";

const authRouteHandlers = [
  ConfirmRegistrationHandler,
  RegistrationUserHandler,
  ResendRegistrationEmailHandler,
  LoginHandler,
  RefreshTokensHandler,
  LogoutHandler,
  AboutMeHandler,
  PasswordRecoveryHandler,
  RenewPasswordHandler,
];

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 10,
      limit: 5,
    }),

    CqrsModule,

    TypeOrmModule.forFeature([
      UserEntity,
      ReftokenEntity,
      DeviceEntity,
      RequestEntity,
    ]),

    ConfigModule.forFeature(getAuthConfiguration),

    DeviceModule,
    UsersModule,
    EmailsModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: "60s" },
    }),

    PassportModule,
  ],

  controllers: [AuthController],
  providers: [
    Logger,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },

    ...authRouteHandlers,
    {
      provide: IUsersRepoToken,
      useClass: UsersSQLRepo,
    },
    {
      provide: IUsersQueryRepoToken,
      useClass: UsersSQLQueryRepo,
    },
    ReftokenSQLRepo,
    {
      provide: IDevicesRepoToken,
      useClass: useRepositoryClassGeneric(DevicesORM, DevicesORM, DevicesORM),
    },
    {
      provide: IRequestRepoToken,
      useClass: useRepositoryClassGeneric(RequestORM, RequestORM, RequestORM),
    },

    AuthService,
    AuthHashClass,

    // {
    //     provide: AAuthService,
    //     useClass: useAuthServiceClass()
    // },
    //
    // AuthORMService,
    // UsersORMRepo,
    //
    // ReftokenSQLRepo,
    // ReftokenORMRepo,
    // AuthSQLService,
    // AuthMongoService,
    // UsersMongoRepo,

    LoggerMiddleware,
    LocalStrategy,
    JwtStrategy,
    JwtService,

    EmailService,
  ],

  exports: [
    // AuthMongoService,
    //
    // ReftokenSQLRepo,
    // ReftokenORMRepo,
    AuthService,
    AuthHashClass,
    EmailService,
    JwtService,
  ],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(AuthController);
  }
}
