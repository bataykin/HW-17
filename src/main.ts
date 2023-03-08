import 'reflect-metadata';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { HttpExceptionFilter } from './http-exception.filter';
import { useContainer } from 'class-validator';
import { PostsModule } from './posts/posts.module';
import cookieParser from 'cookie-parser';
import * as process from 'process';

// const ngrok = require('ngrok');

const PORT = process.env.PORT || 3000;
async function bootstrap() {
  // const url = await ngrok.connect(3000);
  // const url = await ngrok.connect();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['warn', 'error', 'verbose', 'debug'],
    bufferLogs: true,
  });
  const configService = app.get(ConfigService);
  app.enableCors();
  // // app.use('trust proxy', LoggerMiddleware);
  app.set('trust proxy', 1);
  //
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      /*whitelist: true,*/ transform: true,
      stopAtFirstError: false,
    }),
  );
  //
  // useContainer(Container);
  // let validator = Container.get(Validator);
  useContainer(app.select(PostsModule), {
    fallbackOnErrors: true,
    fallback: true,
  });
  // useContainer(app.select(AppModule), { fallbackOnErrors: true , fallback: true});
  // useContainer(app, { fallback: true });
  app.useGlobalFilters(new HttpExceptionFilter());

  // await app.close()

  await app.listen(PORT);
  console.log(`Application is running on: ${await app.getUrl()}`);
  // console.log('auth type', configService.get('authorization').type)
  console.log(
    'REPO_TYPE = ',
    configService.get('REPO_TYPE'),
    ' at ',
    process.env.REPO_TYPE === 'SQL'
      ? configService.get('db.sql')
      : configService.get('db.orm').database,
  );

  console.log('NODE_ENV = ', configService.get('NODE_ENV'));

  // console.log(url)

  // const axios = require("axios");
  // const res = await axios.get('https://www.computeruniverse.net/en/p/90849568')
  // console.log(res)
  // axios({
  //
  // })
  // const options = {
  //     method: 'GET',
  //     url: 'https://www.computeruniverse.net/en/p/90849568',
  // };
  // axios.request(options).then(function (response) {
  //     console.log(response.data);
  // }).catch(function (error) {
  //     console.error(error);
  // });
  // let db = configService.get('db.orm');
  // console.log(db)
  // console.log(useConfigDB())
}

bootstrap();
