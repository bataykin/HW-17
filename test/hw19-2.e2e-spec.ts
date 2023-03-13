import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "./../src/app.module";
import { LikesEnum } from "../src/posts/entities/likes.enum";
import { TestHelpersClass } from "./helpers/testHelpers";

let testClass = new TestHelpersClass();
const users = testClass.createFakeUsers(10);
const posts = testClass.createFakePosts(10);
const blogs = testClass.createFakeBlogs(10);
const comments = testClass.createFakeComments(10);

describe("HW-19-2 (e2e)", () => {
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

  for (let i = 0; i < 5; i++) {
    it('(POST -> "/sa/users" - create 5 users)', () => {
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

  it('(GET -> "/sa/users" - get 5  users)', () => {
    return request(app.getHttpServer())
      .get("/sa/users")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(200)
      .then((res) => {
        expect(res.body.totalCount).toBe(5);
        expect(res.body.items[0].id).toBe(users[4].id);
        expect(res.body.items[0].login).toBe(users[4].input.login);
        expect(res.body.items.length).toBe(5);
        expect(Array.isArray(res.body.items)).toBeTruthy();
      });
  });

  for (let i = 0; i < 5; i++) {
    it('(POST -> "/auth/login" user0 login)', () => {
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
          // testClass.banUserDto.blogId = blogs[0].id;
          // testClass.unbanUserDto.blogId = blogs[0].id;
        })
    );
  });

  it("POST => /blogger/blogs/:blogId/posts - create post0 on blog0 by user0", () => {
    return request(app.getHttpServer())
      .post(`/blogger/blogs/${blogs[0].id}/posts`)
      .send(JSON.stringify(posts[0].input))
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${users[0].accessToken}`)
      .expect(201)
      .then((res) => {
        // console.log(res.body);
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

  for (let i = 0; i < 5; i++) {
    it("(PUT => /posts/:postId/like-status - put 5 Likes on post0 on blog0)", () => {
      return request(app.getHttpServer())
        .put(`/posts/${posts[0].id}/like-status`)
        .send(JSON.stringify(testClass.likeDto))
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${users[i].accessToken}`)
        .expect(204);
    });
  }

  it("GET => /posts/:id - return post0 with 5 likes", () => {
    return request(app.getHttpServer())
      .get(`/posts/${posts[0].id}`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .expect(200)
      .then((res) => {
        // console.log(res.body);
        expect(res.body.id).toBe(posts[0].id);
        expect(res.body.title).toBe(posts[0].input.title);
        expect(res.body.shortDescription).toBe(posts[0].input.shortDescription);
        expect(res.body.content).toBe(posts[0].input.content);
        expect(res.body.blogId).toBe(posts[0].blogId);
        expect(res.body.blogName).toBe(posts[0].blogName);
        expect(res.body.createdAt).toBe(posts[0].createdAt);
        expect(res.body.extendedLikesInfo.likesCount).toBe(5);
        expect(res.body.extendedLikesInfo.dislikesCount).toBe(0);
        expect(res.body.extendedLikesInfo.myStatus).toBe(LikesEnum.None);
        expect(res.body.extendedLikesInfo.newestLikes.length).toBe(3);
        expect(res.body.extendedLikesInfo.newestLikes[0].addedAt).toBeTruthy();
        expect(res.body.extendedLikesInfo.newestLikes[0].userId).toBeTruthy();
        expect(res.body.extendedLikesInfo.newestLikes[0].login).toBeTruthy();
      });
  });

  it("(PUT => /posts/:postId/like-status - put 1 disLike user0 on post0 on blog0)", () => {
    return request(app.getHttpServer())
      .put(`/posts/${posts[0].id}/like-status`)
      .send(JSON.stringify(testClass.dislikeDto))
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${users[0].accessToken}`)
      .expect(204);
  });

  it("GET => /posts/:id - return post0 with 4 likes, 1 dislike from user0 authed", () => {
    return request(app.getHttpServer())
      .get(`/posts/${posts[0].id}`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${users[0].accessToken}`)
      .expect(200)
      .then((res) => {
        console.log(res.body);
        expect(res.body.id).toBe(posts[0].id);
        expect(res.body.title).toBe(posts[0].input.title);
        expect(res.body.shortDescription).toBe(posts[0].input.shortDescription);
        expect(res.body.content).toBe(posts[0].input.content);
        expect(res.body.blogId).toBe(posts[0].blogId);
        expect(res.body.blogName).toBe(posts[0].blogName);
        expect(res.body.createdAt).toBe(posts[0].createdAt);
        expect(res.body.extendedLikesInfo.likesCount).toBe(4);
        expect(res.body.extendedLikesInfo.dislikesCount).toBe(1);
        expect(res.body.extendedLikesInfo.myStatus).toBe(LikesEnum.Dislike);
        expect(res.body.extendedLikesInfo.newestLikes.length).toBe(3);
        expect(res.body.extendedLikesInfo.newestLikes[0].addedAt).toBeTruthy();
        expect(res.body.extendedLikesInfo.newestLikes[0].userId).toBeTruthy();
        expect(res.body.extendedLikesInfo.newestLikes[0].login).toBeTruthy();
      });
  });
});
