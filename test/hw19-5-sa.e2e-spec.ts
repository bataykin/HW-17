import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "./../src/app.module";
import { TestHelpersClass } from "./helpers/testHelpers";

let testClass = new TestHelpersClass();
const users = testClass.createFakeUsers(10);
const posts = testClass.createFakePosts(10);
const blogs = testClass.createFakeBlogs(10);
const comments = testClass.createFakeComments(10);
const counter = 1;

describe("HW-19-5 - SA (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it("DELETE - /testing/all-data)", () => {
    return request(app.getHttpServer()).delete("/testing/all-data").expect(204);
  });

  for (let i = 0; i < counter; i++) {
    it(`(POST -> "/sa/users" - create ${counter} users)`, () => {
      return request(app.getHttpServer())
        .post("/sa/users")
        .send(JSON.stringify(users[i].input))
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .set("Authorization", "Basic YWRtaW46cXdlcnR5")
        .expect(201)
        .then((res) => {
          users[i].id = res.body?.id;
        });
    });
  }

  for (let i = 0; i < counter; i++) {
    it(`(PUT => /sa/users/:id/ban - ban ${counter} users)`, () => {
      return request(app.getHttpServer())
        .put(`/sa/users/${users[i].id}/ban`)
        .send(JSON.stringify(testClass.banUserDto))
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .set("Authorization", "Basic YWRtaW46cXdlcnR5")
        .expect(204)
        .then((res) => {
          // console.log(res.body);
        });
    });
  }

  for (let i = 0; i < counter; i++) {
    it(`(POST -> "/auth/login"  login ${counter} users)`, () => {
      return request(app.getHttpServer())
        .post("/auth/login")
        .send(
          JSON.stringify({
            loginOrEmail: users[i].input.login,
            password: users[i].input.password,
          }),
        )
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .set("user-Agent", "deviceTitle")
        .expect(401)
        .then((res) => {
          console.log(res.body);
          users[i].accessToken = res.body?.accessToken;
          users[i].refreshToken = res.headers["set-cookie"][0]
            .split("=")[1]
            .split(";")[0];
        });
    });
  }
});
