import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "./../src/app.module";
import { TestHelpersClass } from "./helpers/testHelpers";

const cookieParser = require("cookie-parser");

let testClass = new TestHelpersClass();
const users = testClass.createFakeUsers(10);
const posts = testClass.createFakePosts(10);
const blogs = testClass.createFakeBlogs(10);
const comments = testClass.createFakeComments(10);
const counter = 5;

const question = {
  input: {
    body: "adahfhgsdasd",
    correctAnswers: ["asda", "asdgfg", "ert"],
  },
  id: null,
};

// const localDB: TypeOrmModuleOptions = {
//   type: "postgres",
//   host: "localhost",
//   port: 5432,
//   username: "postgres",
//   password: "1984",
//   database: "lalala",
//   autoLoadEntities: true,
//   synchronize: true,
// };

describe("HW-23 - Questions - 1 - blogs (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        stopAtFirstError: true,
        validateCustomDecorators: true,
        validationError: { target: false },
      }),
    );
    await app.init();
  });

  it("DELETE - /testing/all-data)", () => {
    return request(app.getHttpServer()).delete("/testing/all-data").expect(204);
  });

  it(`(POST -> "/sa/users" - create ${counter} users)`, () => {
    return request(app.getHttpServer())
      .post("/sa/users")
      .send(JSON.stringify(users[0].input))
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201)
      .then((res) => {
        users[0].id = res.body?.id;
      });
  });

  it(`(POST -> "/auth/login"  login ${counter} users)`, () => {
    return request(app.getHttpServer())
      .post("/auth/login")
      .send(
        JSON.stringify({
          loginOrEmail: users[0].input.login,
          password: users[0].input.password,
        }),
      )
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("user-Agent", "deviceTitle")
      .expect(200)
      .then((res) => {
        users[0].accessToken = res.body?.accessToken;
        users[0].refreshToken = res.headers["set-cookie"][0]
          .split("=")[1]
          .split(";")[0];
      });
  });

  it(`(POST -> "sa/quiz/questions"  )`, () => {
    return request(app.getHttpServer())
      .post("/sa/quiz/questions")
      .send(JSON.stringify(question.input))
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("user-Agent", "deviceTitle")
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201)
      .then((res) => {
        question.id = res.body.id;
        console.log(res.body);
      });
  });

  it(`(GET -> "sa/quiz/questions"  )`, () => {
    return request(app.getHttpServer())
      .get("/sa/quiz/questions?a=1")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("user-Agent", "deviceTitle")
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(200)
      .then((res) => {
        console.log(res.body);
      });
  });

  it(`(DELETE -> "sa/quiz/questions/:id"  )`, () => {
    return request(app.getHttpServer())
      .delete(`/sa/quiz/questions/${question.id}`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("user-Agent", "deviceTitle")
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(204)
      .then((res) => {
        // console.log(res.body);
      });
  });

  it(`(GET -> "sa/quiz/questions"  )`, () => {
    return (
      request(app.getHttpServer())
        .get("/sa/quiz/questions?a=1")
        .query({})
        // .send({ dto: QuestionsPaginationDTO })
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .set("user-Agent", "deviceTitle")
        .set("Authorization", "Basic YWRtaW46cXdlcnR5")
        .expect(200)
        .then((res) => {
          console.log(res.body);
        })
    );
  });

  it(`(POST -> "sa/quiz/questions"  )`, () => {
    return request(app.getHttpServer())
      .post("/sa/quiz/questions")
      .send(JSON.stringify(question.input))
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("user-Agent", "deviceTitle")
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201)
      .then((res) => {
        question.id = res.body.id;
        console.log(res.body);
      });
  });
});
