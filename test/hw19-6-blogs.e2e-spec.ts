import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "./../src/app.module";
import { TestHelpersClass } from "./helpers/testHelpers";
import { LikesEnum } from "../src/posts/entities/likes.enum";

let testClass = new TestHelpersClass();
const users = testClass.createFakeUsers(10);
const posts = testClass.createFakePosts(10);
const blogs = testClass.createFakeBlogs(10);
const comments = testClass.createFakeComments(10);
const counter = 5;

describe("HW-19-6 - blogs (e2e)", () => {
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

  it("(POST => /blogger/blogs) create blog0 by user0", () => {
    return (
      request(app.getHttpServer())
        .post("/blogger/blogs")
        .send(JSON.stringify(blogs[0].input))
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${users[0].accessToken}`)
        // .set('Cookie', `refreshToken=${user1.refreshToken}`)
        .set("user-Agent", "deviceTitle")
        .expect(201)
        .then((res) => {
          blogs[0].id = res.body?.id;
          blogs[0].createdAt = res.body?.createdAt;
          // testClass.banUserDto.blogId = blogs[0].id;
          // testClass.unbanUserDto.blogId = blogs[0].id;
        })
    );
  });

  for (let i = 0; i < counter; i++) {
    it("POST => /blogger/blogs/:blogId/posts - create 6 posts on blog0 by user0", () => {
      return request(app.getHttpServer())
        .post(`/blogger/blogs/${blogs[0].id}/posts`)
        .send(JSON.stringify(posts[i].input))
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${users[0].accessToken}`)
        .expect(201)
        .then((res) => {
          // console.log(res.body);
          posts[i].id = res.body.id;
          posts[i].createdAt = res.body.createdAt;
          posts[i].blogId = blogs[0].id;
          posts[i].blogName = blogs[0].input.name;
          expect(res.body.blogId).toBe(blogs[0].id);
          expect(res.body.content).toBe(posts[i].input.content);
          expect(res.body.title).toBe(posts[i].input.title);
          expect(res.body.shortDescription).toBe(
            posts[i].input.shortDescription,
          );
          expect(res.body.extendedLikesInfo.likesCount).toBe(0);
          expect(res.body.extendedLikesInfo.myStatus).toBe(LikesEnum.None);
        });
    });
  }

  it("GET => GET -> blogs", () => {
    return request(app.getHttpServer())
      .get(`/blogs/`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${users[0].accessToken}`)
      .expect(200)
      .then((res) => {
        // console.log(res.body);
      });
  });

  it("GET => GET -> blogs/id", () => {
    return request(app.getHttpServer())
      .get(`/blogs/${blogs[0].id}`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${users[0].accessToken}`)
      .expect(200)
      .then((res) => {
        // console.log(res.body);
      });
  });

  it("GET -> /blogs/:blogId/posts", () => {
    return request(app.getHttpServer())
      .get(`/blogs/${blogs[0].id}/posts`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${users[0].accessToken}`)
      .expect(200)
      .then((res) => {
        console.log(res.body);
      });
  });
});
