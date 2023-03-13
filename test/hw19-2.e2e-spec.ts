import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "./../src/app.module";
import { LikesEnum } from "../src/posts/entities/likes.enum";

describe("HW-19-2 (e2e)", () => {
  let app: INestApplication;

  let user1 = {
    input: {
      login: "serega1",
      password: "serega1",
      email: "b11@gmail.com",
    },
    id: null,
    accessToken: null,
    refreshToken: null,
  };

  let user2 = {
    input: {
      login: "serega2",
      password: "serega2",
      email: "b22@gmail.com",
    },
    id: null,
    accessToken: null,
    refreshToken: null,
  };

  let user3 = {
    input: {
      login: "serega3",
      password: "serega3",
      email: "b33@gmail.com",
    },
    id: null,
    accessToken: null,
    refreshToken: null,
  };

  let blog1 = {
    input: {
      name: "somename1",
      description: "string",
      websiteUrl: "https://lengt101-DnZlTI1khUJyQgGnlX5sP3aW3RlaRSQx.com",
    },
    id: null,
    createdAt: null,
  };

  let post1 = {
    input: {
      content: "new post cqontent",
      shortDescription: "description",
      title: "post title",
    },
    id: null,
    blogId: null,
    createdAt: null,
  };

  let comment1 = {
    input: {
      content: "stringstringstringst",
    },
    id: null,
    postId: null,
    createdAt: null,
  };

  let comment2 = {
    input: {
      content: "ANOTHERstringstringstringst",
    },
    id: null,
    postId: null,
    createdAt: null,
  };

  const banReason = "stringstringstringst1";

  const banUserDto = {
    isBanned: true,
    banReason: "stringstringstringst",
    blogId: null,
  };

  const unbanUserDto = {
    isBanned: false,
    banReason: "stringstringstringst",
    blogId: null,
  };

  const banBlogDto = {
    isBanned: true,
  };

  const unbanBlogDto = {
    isBanned: false,
  };

  const wrongUUID = "8f31bcb4-f776-4165-b98f-43d0e687a540";
  const commentUpdateContentDto = {
    content: "commentUpdateContentDtocommentUpdateContentDto",
  };

  const likeDto = {
    likeStatus: LikesEnum.Like,
  };

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

  it('(POST -> "/sa/users" - create user1)', () => {
    return request(app.getHttpServer())
      .post("/sa/users")
      .send(JSON.stringify(user1.input))
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(201)
      .then((res) => {
        user1.id = res.body?.id;
      });
  });

  it('(GET -> "/sa/users" - get 1  user1)', () => {
    return request(app.getHttpServer())
      .get("/sa/users")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .expect(200)
      .then((res) => {
        expect(res.body.totalCount).toBe(1);
        expect(res.body.items[0].id).toBe(user1.id);
        expect(res.body.items[0].login).toBe(user1.input.login);
        expect(res.body.items.length).toBe(1);
        expect(Array.isArray(res.body.items)).toBeTruthy();
      });
  });

  it('(POST -> "/auth/login" user1 login)', () => {
    return request(app.getHttpServer())
      .post("/auth/login")
      .send(
        JSON.stringify({
          loginOrEmail: user1.input.login,
          password: user1.input.password,
        }),
      )
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("user-Agent", "deviceTitle")
      .expect(200)
      .then((res) => {
        user1.accessToken = res.body?.accessToken;
        user1.refreshToken = res.headers["set-cookie"][0]
          .split("=")[1]
          .split(";")[0];
      });
  });

  it("(POST => /blogger/blogs) create blog1 by user1", () => {
    return (
      request(app.getHttpServer())
        .post("/blogger/blogs")
        .send(JSON.stringify(blog1.input))
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${user1.accessToken}`)
        // .set('Cookie', `refreshToken=${user1.refreshToken}`)
        .set("user-Agent", "deviceTitle")
        .expect(201)
        .then((res) => {
          blog1.id = res.body?.id;
          blog1.createdAt = res.body?.createdAt;
          banUserDto.blogId = blog1.id;
          unbanUserDto.blogId = blog1.id;
        })
    );
  });

  it("POST => /blogger/blogs/:blogId/posts - create post1 on blog1 b user1", () => {
    return request(app.getHttpServer())
      .post(`/blogger/blogs/${blog1.id}/posts`)
      .send(JSON.stringify(post1.input))
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${user1.accessToken}`)
      .expect(201)
      .then((res) => {
        // console.log(res.body);
        post1.id = res.body.id;
        post1.createdAt = res.body.createdAt;
        post1.blogId = blog1.id;
        expect(res.body.blogId).toBe(blog1.id);
        expect(res.body.content).toBe(post1.input.content);
        expect(res.body.title).toBe(post1.input.title);
        expect(res.body.shortDescription).toBe(post1.input.shortDescription);
        expect(res.body.extendedLikesInfo.likesCount).toBe(0);
        expect(res.body.extendedLikesInfo.myStatus).toBe(LikesEnum.None);
      });
  });

  it("(PUT => /posts/:postId/like-status - put Like on post1 on blog1)", () => {
    return request(app.getHttpServer())
      .put(`/posts/${post1.id}/like-status`)
      .send(JSON.stringify(likeDto))
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${user1.accessToken}`)
      .expect(204);
  });
});
