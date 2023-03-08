// this  configModule should be first import ever
import { configModule } from "./config/configModule";
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { TestingModule } from "./testing/testing.module";
import { BloggersModule } from "./bloggers/bloggers.module";
import { PostsModule } from "./posts/posts.module";
import { CommentsModule } from "./comments/comments.module";
import { MongooseModule } from "@nestjs/mongoose";
import { TypeOrmModule } from "@nestjs/typeorm";
import { QuizModule } from "./quiz/quiz.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { DeviceModule } from "./device/device.module";
import { SuperAdminModule } from "./superadmin/superAdminModule";

@Module({
  imports: [
    configModule,

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) =>
        process.env.REPO_TYPE === 'SQL'
          ? config.get('db.sql')
          : config.get('db.orm'),
      inject: [ConfigService],
    }),

    // TypeOrmModule.forRoot(
    //
    //     // useConfigDB
    //     // 'database'
    //     // useConfigDB.getDBConfig()
    //     // ...ConfigDB
    //     {
    //         type: 'postgres',
    //         host: 'ec2-44-209-186-51.compute-1.amazonaws.com',
    //         port: 5432,
    //         username: 'cvgiiixvsbqffh',
    //         password: 'b7572ff957991b35f119a7243fd3d9c86a1a8e3910a1ea0e092dea42766224a3',
    //         database: 'd4077oemu2h6p7',
    //         // type: useConfigDB().type,
    //         // host: useConfigDB().host,
    //         // port: useConfigDB().port,
    //         // username: useConfigDB().username,
    //         // password: useConfigDB().password,
    //         // database: useConfigDB().database,
    //         ssl: {
    //             rejectUnauthorized: false
    //         },
    //         autoLoadEntities: true,
    //         synchronize: true,
    //
    //         // entities: [BloggerEntity],
    //
    //     }
    // ),

    MongooseModule.forRoot(process.env.MONGO_URI, {
      dbName: 'local',
      autoIndex: true,
    }),
    QuizModule,
    UsersModule,
    AuthModule,
    TestingModule,
    BloggersModule,
    PostsModule,
    CommentsModule,
    DeviceModule,
    SuperAdminModule,
    // BlogPostModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // IsBlogExistConstraint,
    // {
    //     provide: APP_FILTER,
    //     useClass: HttpExceptionFilter,
    // },
  ],
})
export class AppModule {
  // constructor(private dataSource: DataSource) {}
}

// export class AppModule implements NestModule {
//     configure(consumer: MiddlewareConsumer) {
//         consumer
//             .apply(LoggerMiddleware)
//             .forRoutes(UpdatePostByBlogHandler)
//
//     }
// }
