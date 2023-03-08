import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "./../src/app.module";

describe('HW-16 - 4 (e2e)', () => {
  let app: INestApplication;

  let user1 = {
    input: {
      login: 'serega1',
      password: 'serega1',
      email: 'b11@gmail.com',
    },
    id: null,
    accessToken: null,
    refreshToken: null,
  };

  let user2 = {
    input: {
      login: 'serega2',
      password: 'serega2',
      email: 'b22@gmail.com',
    },
    id: null,
    accessToken: null,
    refreshToken: null,
  };

  let blog1 = {
    input: {
      name: 'somename1',
      description: 'string',
      websiteUrl: 'https://lengt101-DnZlTI1khUJyQgGnlX5sP3aW3RlaRSQx.com',
    },
    id: null,
    createdAt: null,
  };

  let post1 = {
    input: {
      content: 'new post cqontent',
      shortDescription: 'description',
      title: 'post title',
    },
    id: null,
    blogId: null,
  };

  let comment1 = {
    input: {
      content: 'stringstringstringst',
    },
    id: null,
    postId: null,
  };

  let comment2 = {
    input: {
      content: 'ANOTHERstringstringstringst',
    },
    id: null,
    postId: null,
  };

  const banReason = 'stringstringstringst1';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('DELETE - /testing/all-data)', () => {
    return request(app.getHttpServer()).delete('/testing/all-data').expect(204);
  });

  it('(GET => /sa/users?pageSize=50)', () => {
    return request(app.getHttpServer())
      .get('/sa/users')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(200)
      .then((res) => {
        expect(res.body.totalCount).toBe(0);
        expect(res.body.items.length).toBe(0);
        expect(Array.isArray(res.body.items)).toBeTruthy();
      });
  });

  it('(POST -> "/sa/users" - create user1)', () => {
    return request(app.getHttpServer())
      .post('/sa/users')
      .send(JSON.stringify(user1.input))
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(201)
      .then((res) => {
        user1.id = res.body?.id;
      });
  });

  it('(GET => /sa/users?pageSize=50)', () => {
    return request(app.getHttpServer())
      .get('/sa/users')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(200)
      .then((res) => {
        expect(res.body.totalCount).toBe(1);
        expect(res.body.items[0].id).toBe(user1.id);
        expect(res.body.items.length).toBe(1);
        expect(Array.isArray(res.body.items)).toBeTruthy();
        expect(res.body.items[0]).toHaveProperty('banInfo');
      });
  });

  it('(POST -> "/auth/login" user1 login)', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send(
        JSON.stringify({
          loginOrEmail: user1.input.login,
          password: user1.input.password,
        }),
      )
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('user-Agent', 'deviceTitle')
      .expect(200)
      .then((res) => {
        user1.accessToken = res.body?.accessToken;
        user1.refreshToken = res.headers['set-cookie'][0]
          .split('=')[1]
          .split(';')[0];
      });
  });

  it('GET /blogger/blogs/comments - get no comment', () => {
    return request(app.getHttpServer())
      .get('/blogger/blogs/comments')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${user1.accessToken}`)
      .expect(200)
      .then((res) => {
        expect(res.body.totalCount).toBe(0);
        expect(res.body.items.length).toBe(0);
        expect(Array.isArray(res.body.items)).toBeTruthy();
      });
  });

  it('(POST -> "/sa/users"  - create user2)', () => {
    return request(app.getHttpServer())
      .post('/sa/users')
      .send(JSON.stringify(user2.input))
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(201)
      .then((res) => {
        user2.id = res.body?.id;
      });
  });

  it('(POST -> "/auth/login" user2 login)', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send(
        JSON.stringify({
          loginOrEmail: user2.input.login,
          password: user2.input.password,
        }),
      )
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('user-Agent', 'deviceTitle')
      .expect(200)
      .then((res) => {
        user2.accessToken = res.body?.accessToken;
        user2.refreshToken = res.headers['set-cookie'][0]
          .split('=')[1]
          .split(';')[0];
      });
  });

  it('(POST => /blogger/blogs) create blog1 by user1', () => {
    return (
      request(app.getHttpServer())
        .post('/blogger/blogs')
        .send(JSON.stringify(blog1.input))
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${user1.accessToken}`)
        // .set('Cookie', `refreshToken=${user1.refreshToken}`)
        .set('user-Agent', 'deviceTitle')
        .expect(201)
        .then((res) => {
          blog1.id = res.body?.id;
          blog1.createdAt = res.body?.createdAt;
        })
    );
  });

  it('(POST => /blogger/blogs) create post1 in blog1 by user1', () => {
    return (
      request(app.getHttpServer())
        .post(`/blogger/blogs/${blog1.id}/posts`)
        .send(JSON.stringify(post1.input))
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${user1.accessToken}`)
        // .set('Cookie', `refreshToken=${user1.refreshToken}`)
        .set('user-Agent', 'deviceTitle')
        .expect(201)
        .then((res) => {
          post1.id = res.body?.id;
          post1.blogId = res.body?.blogId;
        })
    );
  });

  it('(POST => /blogger/blogs) create comment1 in post1 in blog1 by user1', () => {
    return (
      request(app.getHttpServer())
        .post(`/posts/${post1.id}/comments`)
        .send(JSON.stringify(comment1.input))
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${user1.accessToken}`)
        // .set('Cookie', `refreshToken=${user1.refreshToken}`)
        .set('user-Agent', 'deviceTitle')
        .expect(201)
        .then((res) => {
          expect(res.body).toHaveProperty('commentatorInfo');
          expect(res.body.commentatorInfo).toHaveProperty('userId');
          expect(res.body.commentatorInfo).toHaveProperty('userLogin');
          expect(res.body).toHaveProperty('likesInfo');
          expect(res.body.likesInfo).toHaveProperty('likesCount');
          expect(res.body.likesInfo).toHaveProperty('dislikesCount');
          expect(res.body.likesInfo).toHaveProperty('myStatus');
          comment1.id = res.body?.id;
          comment1.postId = post1.id;
          // expect.arrayContaining();
        })
    );
  });

  it('GET /blogger/blogs/comments - get 1 comment', () => {
    return request(app.getHttpServer())
      .get('/blogger/blogs/comments')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${user1.accessToken}`)
      .expect(200)
      .then((res) => {
        expect(res.body.totalCount).toBe(1);
        expect(res.body.items.length).toBe(1);
        expect(Array.isArray(res.body.items)).toBeTruthy();
        expect(res.body.items[0]).toHaveProperty('commentatorInfo');
      });
  });

  it('(POST => /blogger/blogs) create comment2 in post1 in blog1 by user2', () => {
    return (
      request(app.getHttpServer())
        .post(`/posts/${post1.id}/comments`)
        .send(JSON.stringify(comment2.input))
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${user2.accessToken}`)
        // .set('Cookie', `refreshToken=${user1.refreshToken}`)
        .set('user-Agent', 'deviceTitle')
        .expect(201)
        .then((res) => {
          expect(res.body).toHaveProperty('commentatorInfo');
          expect(res.body.commentatorInfo).toHaveProperty('userId');
          expect(res.body.commentatorInfo).toHaveProperty('userLogin');
          // expect(res.body).toHaveProperty('likesInfo');
          // expect(res.body.likesInfo).toHaveProperty('likesCount');
          // expect(res.body.likesInfo).toHaveProperty('dislikesCount');
          // expect(res.body.likesInfo).toHaveProperty('myStatus');
          comment2.id = res.body?.id;
          comment2.postId = post1.id;
          // expect.arrayContaining();
        })
    );
  });

  it('GET - /blogger/blogs/comments - get 2 comments', () => {
    return request(app.getHttpServer())
      .get('/blogger/blogs/comments')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${user1.accessToken}`)
      .expect(200)
      .then((res) => {
        console.log(res.body);
        expect(res.body.totalCount).toBe(2);
        expect(res.body.items.length).toBe(2);
        expect(Array.isArray(res.body.items)).toBeTruthy();
      });
  });
});
