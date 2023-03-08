import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "./../src/app.module";
import * as assert from "assert";

describe('HW-16 - 1 (e2e)', () => {
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

  let blog1 = {
    input: {
      name: 'somename1',
      description: 'string',
      websiteUrl: 'https://lengt101-DnZlTI1khUJyQgGnlX5sP3aW3RlaRSQx.com',
    },
    id: null,
    createdAt: null,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // it('/ (GET)', () => {
  //   return request(app.getHttpServer())
  //     .get('/')
  //     .expect(200)
  //     .expect('Hello World!');
  // });

  it('DELETE - /testing/all-data)', () => {
    return request(app.getHttpServer()).delete('/testing/all-data').expect(204);
  });

  it('(POST -> "/sa/users")', () => {
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

  it('(POST -> "/auth/login")', () => {
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

  it('(POST => /blogger/blogs)', () => {
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

  it('(GET => /blogs)', () => {
    return request(app.getHttpServer())
      .get('/blogs')
      .expect(200)
      .then((res) => {
        assert.equal(res.body.totalCount, 1);
        assert.equal(res.body.items[0].id, blog1.id);
        assert.equal(res.body.items[0].isMembership, false);
        assert.equal(res.body.items.length, 1);
      });
  });

  it('(GET => /blogs/:id)', () => {
    return request(app.getHttpServer())
      .get(`/blogs/${blog1.id}`)
      .expect(200)
      .then((res) => {
        assert.equal(res.body.id, blog1.id);
      });
  });

  it('(GET => /sa/blogs)', () => {
    return request(app.getHttpServer())
      .get(`/sa/blogs`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(200)
      .then((res) => {
        expect(res.body.totalCount).toBe(1);
        expect(res.body.items[0].id).toBe(blog1.id);
        expect(res.body.items.length).toBe(1);
        expect(Array.isArray(res.body.items)).toBeTruthy();
        expect(res.body.items[0]).toHaveProperty('blogOwnerInfo');
        expect(res.body.items[0]).toHaveProperty('banInfo');
      });
  });

  it('(PUT -> "/sa/blogs/:id/ban" set ban)', () => {
    return request(app.getHttpServer())
      .put(`/sa/blogs/${blog1.id}/ban`)
      .send({ isBanned: true })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(204)
      .then((res) => {});
  });

  it('(GET => /blogs should not showing items after ban blog1)', () => {
    return request(app.getHttpServer())
      .get('/blogs')
      .expect(200)
      .then((res) => {
        expect(res.body.totalCount).toBe(0);
        expect(res.body.items.length).toBe(0);
      });
  });

  it('(GET => /blogs/:id should not showing after ban blog1)', () => {
    return request(app.getHttpServer())
      .get(`/blogs/${blog1.id}`)
      .expect(404)
      .then((res) => {
        expect(res.body).not.toContain('id');
      });
  });

  it('(GET => /sa/blogs should show also banned blog)', () => {
    return request(app.getHttpServer())
      .get(`/sa/blogs`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(200)
      .then((res) => {
        expect(res.body.totalCount).toBe(1);
        expect(res.body.items[0].id).toBe(blog1.id);
        expect(res.body.items.length).toBe(1);
        expect(Array.isArray(res.body.items)).toBeTruthy();
        expect(res.body.items[0]).toHaveProperty('blogOwnerInfo');
        expect(res.body.items[0]).toHaveProperty('banInfo');
      });
  });

  it('(PUT -> "/sa/blogs/:id/ban" should unban blog1)', () => {
    return request(app.getHttpServer())
      .put(`/sa/blogs/${blog1.id}/ban`)
      .send({ isBanned: false })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .expect(204);
  });

  it('(GET => /blogs should showing items after unban blog1)', () => {
    return request(app.getHttpServer())
      .get('/blogs')
      .expect(200)
      .then((res) => {
        expect(res.body.totalCount).toBe(1);
        expect(res.body.items.length).toBe(1);
      });
  });
});
