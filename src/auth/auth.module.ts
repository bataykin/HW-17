import { Logger, MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AuthMongoService } from "./oldServiceRepos/auth.Mongo.service";
import { AuthController } from "./auth.controller";
import { AuthUtilsClass } from "./auth.utils";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "../users/user.schema";
import { EmailService } from "../common/email/email.service";
import { UsersModule } from "../users/users.module";
import { APP_GUARD } from "@nestjs/core";
import { EmailsModule } from "../common/email/emails.module";
import { Request, RequestSchema } from "../guards/request.schema";
import { RequestRepoClass } from "./reuest.repo";
import { LoggerMiddleware } from "../middlewares/logger.middleware";
import { JwtServiceClass } from "../common/jwt/jwt-service-class.service";
import { RefreshToken, RefreshTokenSchema } from "../common/jwt/refresh.token.schema";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { LocalStrategy } from "./strategies/local.strategy";
import { jwtConstants } from "./constants";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { AuthSQLService } from "./oldServiceRepos/auth.SQL.service";
import { ConfigModule } from "@nestjs/config";
import { getAuthConfiguration } from "./configuration/authConfiguration";
import { AuthORMService } from "./oldServiceRepos/auth.ORM.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "../users/entity/user.entity";
import { ReftokenEntity } from "./entities/reftoken.entity";
import { ReftokenORMRepo } from "./oldServiceRepos/reftoken.ORM.repo";
import { AuthService } from "./authService";
import { CqrsModule } from "@nestjs/cqrs";
import { ConfirmRegistrationHandler } from "./useCase/confirmRegistrationHandler";
import { IUsersRepoToken } from "../users/IUsersRepo";
import { useRepositoryClassGeneric } from "../common/useRepositoryClassGeneric";
import { UsersORM } from "../users/users.ORM";
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

export const useAuthServiceClass = () => {
  if (process.env.REPO_TYPE === 'MONGO') {
    return AuthMongoService;
  } else if (process.env.REPO_TYPE === 'SQL') {
    return AuthSQLService;
  } else if (process.env.REPO_TYPE === 'ORM') {
    return AuthORMService;
  } else return AuthMongoService; // by DEFAULT if not in enum
};

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

    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Request.name, schema: RequestSchema }]),
    MongooseModule.forFeature([
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
    EmailsModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
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
      useClass: useRepositoryClassGeneric(UsersORM, UsersORM, UsersORM),
    },
    ReftokenORMRepo,
    {
      provide: IDevicesRepoToken,
      useClass: useRepositoryClassGeneric(DevicesORM, DevicesORM, DevicesORM),
    },
    {
      provide: IRequestRepoToken,
      useClass: useRepositoryClassGeneric(RequestORM, RequestORM, RequestORM),
    },

    AuthService,
    AuthUtilsClass,

    RequestRepoClass,

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
    JwtServiceClass,
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
    AuthUtilsClass,
    EmailService,
    JwtServiceClass,
    JwtService,
  ],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(AuthController);
  }
}
