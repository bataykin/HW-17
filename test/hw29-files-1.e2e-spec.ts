import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "./../src/app.module";
import { TestHelpersClass } from "./helpers/testHelpers";
import { LikesEnum } from "../src/posts/entities/likes.enum";
import * as path from "path";

const cookieParser = require("cookie-parser");

let testClass = new TestHelpersClass();
const counter = 5;
const users = testClass.createFakeUsers(counter);
const posts = testClass.createFakePosts(counter);
const blogs = testClass.createFakeBlogs(counter);
const comments = testClass.createFakeComments(counter);

const questions = testClass.createFakeQuestions(counter);
const answers = testClass.createRandomAnswers(counter, questions);

const correctAnswer = {
  answer: "correct",
};

const incorrectAnswer = {
  answer: "incorrect",
};
let gameId = null;

let published = {
  published: true,
};

describe("HW-29 - Files - 1 (e2e)", () => {
  let app: INestApplication;
  jest.setTimeout(10000);

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

  // it("DELETE - /testing/all-data)", () => {
  //   return request(app.getHttpServer()).delete("/testing/all-data").expect(204);
  // });

  for (let i = 0; i < 2; i++) {
    it(`(POST -> "/sa/users" - create 2 users)`, () => {
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

  for (let i = 0; i < 2; i++) {
    it(`(POST -> "/auth/login"  login 2 users)`, () => {
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
        .expect(200)
        .then((res) => {
          users[i].accessToken = res.body?.accessToken;
          users[i].refreshToken = res.headers["set-cookie"][0]
            .split("=")[1]
            .split(";")[0];
        });
    });
  }

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
        })
    );
  });

  it("POST => /blogger/blogs/:blogId/posts - create posts0 on blogs0 by user0", () => {
    return request(app.getHttpServer())
      .post(`/blogger/blogs/${blogs[0].id}/posts`)
      .send(JSON.stringify(posts[0].input))
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${users[0].accessToken}`)
      .expect(201)
      .then((res) => {
        // console.log(res.body);
        // console.log(path.join(__dirname, "img-940x432.png"));
        posts[0].id = res.body.id;
        posts[0].createdAt = res.body.createdAt;
        posts[0].blogId = blogs[0].id;
        posts[0].blogName = blogs[0].input.name;
        expect(res.body.blogId).toBe(blogs[0].id);
        expect(res.body.content).toBe(posts[0].input.content);
        expect(res.body.title).toBe(posts[0].input.title);
        expect(res.body.shortDescription).toBe(posts[0].input.shortDescription);
        expect(res.body.extendedLikesInfo.likesCount).toBe(0);
        expect(res.body.extendedLikesInfo.myStatus).toBe(LikesEnum.None);
      });
  });

  it(
    "POST -> blogger/blogs/:blogId/posts/:postId/images/main , " +
      "Add main image 940x432 to post",
    () => {
      // const file = fs.readFileSync(path.join(__dirname, "img-940x432.png"));

      return (
        request(app.getHttpServer())
          .post(
            `/blogger/blogs/${blogs[0].id}/posts/${posts[0].id}/images/main`,
          )
          .attach("file", path.join(__dirname, "img-940x432.png"))
          // .send(imageData)
          // .set("Content-Type", "multipart/form-data")
          .set("Accept", "*/*")
          .set("Authorization", `Bearer ${users[0].accessToken}`)
          // .expect(201)
          .then((res) => {
            console.log(res.body);
          })
      );
    },
  );

  it(
    "POST -> blogger/blogs/:blogId/posts/:postId/images/main , " +
      "Add main image 940x432 to post",
    () => {
      // const file = fs.readFileSync(path.join(__dirname, "img-940x432.png"));

      return (
        request(app.getHttpServer())
          .post(
            `/blogger/blogs/${blogs[0].id}/posts/${posts[0].id}/images/main`,
          )
          .attach("file", path.join(__dirname, "img-940x432.png"))
          // .send(imageData)
          // .set("Content-Type", "multipart/form-data")
          .set("Accept", "*/*")
          .set("Authorization", `Bearer ${users[0].accessToken}`)
          // .expect(201)
          .then((res) => {
            console.log(res.body);
          })
      );
    },
  );

  it(
    "POST -> blogger/blogs/:blogId/images/wallpaper , " +
      "Add wallpaper image 1028x312 to blog",
    () => {
      return (
        request(app.getHttpServer())
          .post(`/blogger/blogs/${blogs[0].id}/images/wallpaper`)
          .attach("file", path.join(__dirname, "img-1028x312.jpg"))
          // .send(imageData)
          // .set("Content-Type", "multipart/form-data")
          .set("Accept", "*/*")
          .set("Authorization", `Bearer ${users[0].accessToken}`)
          // .expect(201)
          .then((res) => {
            // console.log(res.body);
          })
      );
    },
  );
});
