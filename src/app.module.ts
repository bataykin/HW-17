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
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { DeviceModule } from "./device/device.module";
import { SuperAdminModule } from "./superadmin/superAdminModule";
import { QuizModule } from "./quiz/quiz.module";
import { ImagesModule } from "./images/images.module";

@Module({
  imports: [
    configModule,

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) =>
        process.env.REPO_TYPE === "SQL"
          ? config.get("db.sql")
          : config.get("db.orm"),
      inject: [ConfigService],
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
    ImagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
