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

describe("HW-19-3 (e2e)", () => {
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

  for (let i = 0; i < 6; i++) {
    it('(POST -> "/sa/users" - create 6 users)', () => {
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

  for (let i = 0; i < 6; i++) {
    it('(POST -> "/auth/login"  login 6 users)', () => {
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
  for (let i = 0; i < 6; i++) {
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

  for (let i = 0; i < 6; i++) {
    it("(PUT => /posts/:postId/like-status - put 3 Likes 3 dislikes on post0 on blog0)", () => {
      return request(app.getHttpServer())
        .put(`/posts/${posts[0].id}/like-status`)
        .send(JSON.stringify(i % 2 ? testClass.likeDto : testClass.dislikeDto))
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${users[i].accessToken}`)
        .expect(204);
    });
  }

  it("GET => /posts/:id - return post0 with 3 likes 3 dislikes from user0 authed", () => {
    return request(app.getHttpServer())
      .get(`/posts/${posts[0].id}`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${users[0].accessToken}`)
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
        expect(res.body.extendedLikesInfo.likesCount).toBe(3);
        expect(res.body.extendedLikesInfo.dislikesCount).toBe(3);
        expect(res.body.extendedLikesInfo.myStatus).toBe(LikesEnum.Dislike);
        expect(res.body.extendedLikesInfo.newestLikes.length).toBe(3);
        expect(res.body.extendedLikesInfo.newestLikes[0].addedAt).toBeTruthy();
        expect(res.body.extendedLikesInfo.newestLikes[0].userId).toBeTruthy();
        expect(res.body.extendedLikesInfo.newestLikes[0].login).toBeTruthy();
      });
  });

  // it("(PUT => /posts/:postId/like-status - put 1 disLike user0 on post0 on blog0)", () => {
  //   return request(app.getHttpServer())
  //     .put(`/posts/${posts[0].id}/like-status`)
  //     .send(JSON.stringify(testClass.dislikeDto))
  //     .set("Content-Type", "application/json")
  //     .set("Accept", "application/json")
  //     .set("Authorization", `Bearer ${users[0].accessToken}`)
  //     .expect(204);
  // });

  it("GET => /posts - return post0 with 3 likes, 3 dislike public request", () => {
    return request(app.getHttpServer())
      .get(`/posts`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .expect(200)
      .then((res) => {
        // console.dir(res.body);
        expect(res.body.pagesCount).toBe(1);
        expect(res.body.page).toBe(1);
        expect(res.body.pageSize).toBe(10);
        expect(res.body.items.length).toBe(6);

        expect(res.body.items[0].title).toBe(posts[5].input.title);
        expect(res.body.items[0].shortDescription).toBe(
          posts[5].input.shortDescription,
        );
        expect(res.body.items[0].content).toBe(posts[5].input.content);
        expect(res.body.items[0].blogId).toBe(posts[5].blogId);
        expect(res.body.items[0].blogName).toBe(posts[5].blogName);
        // expect(res.body.items[0].createdAt).toBe(posts[5].createdAt);
        expect(res.body.items[5].extendedLikesInfo.likesCount).toBe(3);
        expect(res.body.items[5].extendedLikesInfo.dislikesCount).toBe(3);
        expect(res.body.items[5].extendedLikesInfo.myStatus).toBe(
          LikesEnum.None,
        );
        expect(res.body.items[5].extendedLikesInfo.newestLikes.length).toBe(3);
        expect(
          res.body.items[5].extendedLikesInfo.newestLikes[0].addedAt,
        ).toBeTruthy();
        expect(
          res.body.items[5].extendedLikesInfo.newestLikes[0].userId,
        ).toBeTruthy();
        expect(
          res.body.items[5].extendedLikesInfo.newestLikes[0].login,
        ).toBeTruthy();
      });
  });

  it("GET -> /blogs/:blogId/posts - get 6 posts auth user0", () => {
    return request(app.getHttpServer())
      .get(`/blogs/${blogs[0].id}/posts`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${users[0].accessToken}`)
      .expect(200)
      .then((res) => {
        // console.dir(res.body);
        expect(res.body.pagesCount).toBe(1);
        expect(res.body.page).toBe(1);
        expect(res.body.pageSize).toBe(10);
        expect(res.body.items.length).toBe(6);

        expect(res.body.items[0].title).toBe(posts[5].input.title);
        expect(res.body.items[0].shortDescription).toBe(
          posts[5].input.shortDescription,
        );
        expect(res.body.items[0].content).toBe(posts[5].input.content);
        expect(res.body.items[0].blogId).toBe(posts[5].blogId);
        expect(res.body.items[0].blogName).toBe(posts[5].blogName);
        // expect(res.body.items[0].createdAt).toBe(posts[5].createdAt);
        expect(res.body.items[5].extendedLikesInfo.likesCount).toBe(3);
        expect(res.body.items[5].extendedLikesInfo.dislikesCount).toBe(3);
        expect(res.body.items[5].extendedLikesInfo.myStatus).toBe(
          LikesEnum.Dislike,
        );
        expect(res.body.items[5].extendedLikesInfo.newestLikes.length).toBe(3);
        expect(
          res.body.items[5].extendedLikesInfo.newestLikes[0].addedAt,
        ).toBeTruthy();
        expect(
          res.body.items[5].extendedLikesInfo.newestLikes[0].userId,
        ).toBeTruthy();
        expect(
          res.body.items[5].extendedLikesInfo.newestLikes[0].login,
        ).toBeTruthy();
      });
  });
});
