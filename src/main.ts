import "reflect-metadata";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { HttpExceptionFilter } from "./http-exception.filter";
import { useContainer } from "class-validator";
import { PostsModule } from "./posts/posts.module";
import cookieParser from "cookie-parser";
import * as process from "process";

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ["warn", "error", "verbose", "debug"],
    bufferLogs: true,
  });
  const configService = app.get(ConfigService);
  app.enableCors();
  app.set("trust proxy", 1);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      validateCustomDecorators: true,
      // exceptionFactory: (validationErrors: ValidationError[] = []) => {
      //   return new BadRequestException(validationErrors);
      // }
      validationError: { target: false },
    }),
  );
  useContainer(app.select(PostsModule), {
    fallbackOnErrors: true,
    fallback: true,
  });
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(PORT);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(
    "REPO_TYPE = ",
    configService.get("REPO_TYPE"),
    " at ",
    process.env.REPO_TYPE === "SQL"
      ? configService.get("db.sql").database
      : configService.get("db.orm").database,
  );
  console.log("NODE_ENV = ", configService.get("NODE_ENV"));
}

bootstrap();
