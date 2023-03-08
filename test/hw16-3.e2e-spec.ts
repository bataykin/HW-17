import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "./../src/app.module";

describe('HW-16 - 3 (e2e)', () => {
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

  it('(GET => /sa/users)', () => {
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

  it('(PUT -> /blogger/users/:id/ban user1 set ban to user2)', () => {
    return request(app.getHttpServer())
      .put(`/blogger/users/${user2.id}/ban`)
      .send({
        isBanned: true,
        banReason: banReason,
        blogId: blog1.id,
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${user1.accessToken}`)
      .expect(204)
      .then((res) => {});
  });

  it('(GET => /sa/users  - get 2 users)', () => {
    return request(app.getHttpServer())
      .get('/sa/users')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(200)
      .then((res) => {
        expect(res.body.totalCount).toBe(2);
        expect(Array.isArray(res.body.items)).toBeTruthy();
        expect(res.body.items[0].id).toBe(user2.id);
        expect(res.body.items[0]).toHaveProperty('banInfo');
        expect(res.body.items[0].banInfo.isBanned).toBe(false);
        expect(res.body.items[1].banInfo.isBanned).toBe(false);
        expect(res.body.items[0].banInfo.banReason).toBe(null);
        expect(res.body.items[1].banInfo.banReason).toBe(null);
        expect(res.body.items.length).toBe(2);
      });
  });

  // problem is down

  it('(GET -> "blogger/users/blog/:id": should return banned users array )', () => {
    return request(app.getHttpServer())
      .get(`/blogger/users/blog/${blog1.id}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${user1.accessToken}`)
      .expect(200)
      .then((res) => {
        console.dir(res.body);
      });
  });
});
