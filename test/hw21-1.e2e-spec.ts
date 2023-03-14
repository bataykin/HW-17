import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
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

describe("HW-21 - 1 - blogs (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
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

  it(`(GET -> "/auth/me"  )`, () => {
    return request(app.getHttpServer())
      .get("/auth/me")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("user-Agent", "deviceTitle")
      .set("Authorization", `Bearer ${users[0].accessToken}`)
      .expect(200)
      .then((res) => {
        // console.log(res.body);
      });
  });

  it(`(POST -> "/auth/refresh-token"  )`, () => {
    return (
      request(app.getHttpServer())
        .post("/auth/refresh-token")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .set("user-Agent", "deviceTitle")
        .set("Cookie", `refreshToken=${users[0].refreshToken}`)
        // .set("Authorization", `Bearer ${users[0].accessToken}`)
        // .expect(200)
        .then((res) => {
          console.log(res.body);
        })
    );
  });
});
