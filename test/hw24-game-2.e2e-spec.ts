import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "./../src/app.module";
import { TestHelpersClass } from "./helpers/testHelpers";

const cookieParser = require("cookie-parser");

// const localDB: TypeOrmModuleOptions = {
//   type: "postgres",
//   host: "localhost",
//   port: 5432,
//   username: "postgres",
//   password: "1984",
//   database: "lalala",
//   autoLoadEntities: true,
//   synchronize: true,
// };

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

describe("HW-24 - Game - 2 (e2e)", () => {
  let app: INestApplication;

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

  it("DELETE - /testing/all-data)", () => {
    return request(app.getHttpServer()).delete("/testing/all-data").expect(204);
  });

  for (let i = 0; i < counter; i++) {
    it(`(POST -> "sa/quiz/questions put 10 questions toDB"  )`, () => {
      return request(app.getHttpServer())
        .post("/sa/quiz/questions")
        .send(JSON.stringify(questions[i].input))
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .set("user-Agent", "deviceTitle")
        .set("Authorization", "Basic YWRtaW46cXdlcnR5")
        .expect(201)
        .then((res) => {
          questions[i].id = res.body.id;
          // console.log(res.body);
        });
    });
  }

  for (let i = 0; i < counter; i++) {
    it(`(POST -> "sa/quiz/questions/{id}/publish "  )`, () => {
      return request(app.getHttpServer())
        .put(`/sa/quiz/questions/${questions[i].id}/publish`)
        .send(JSON.stringify(published))
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .set("user-Agent", "deviceTitle")
        .set("Authorization", "Basic YWRtaW46cXdlcnR5")
        .expect(204)
        .then((res) => {
          // console.log(res.body);
        });
    });
  }

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

  it(`(POST: pair-game-quiz/pairs/connection to create pending game by user0"  )`, () => {
    return request(app.getHttpServer())
      .post("/pair-game-quiz/pairs/connection")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("user-Agent", "deviceTitle")
      .set("Authorization", `Bearer ${users[0].accessToken}`)
      .expect(200)
      .then((res) => {
        gameId = res.body.id;
      });
  });

  it(`(POST: pair-game-quiz/pairs/connection to join pending game by user1"  )`, () => {
    return request(app.getHttpServer())
      .post("/pair-game-quiz/pairs/connection")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("user-Agent", "deviceTitle")
      .set("Authorization", `Bearer ${users[1].accessToken}`)
      .expect(200)
      .then((res) => {
        // console.log(res.body);
      });
  });

  ///////////

  it(`(POST: /pair-game-quiz/pairs/my-current/answers send answer by user0"  )`, () => {
    return request(app.getHttpServer())
      .post("/pair-game-quiz/pairs/my-current/answers")
      .send(JSON.stringify(correctAnswer))
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("user-Agent", "deviceTitle")
      .set("Authorization", `Bearer ${users[0].accessToken}`)
      .expect(200)
      .then((res) => {
        //1-0
      });
  });

  it(`(POST: /pair-game-quiz/pairs/my-current/answers send answer by user1"  )`, () => {
    return request(app.getHttpServer())
      .post("/pair-game-quiz/pairs/my-current/answers")
      .send(JSON.stringify(incorrectAnswer))
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("user-Agent", "deviceTitle")
      .set("Authorization", `Bearer ${users[1].accessToken}`)
      .expect(200)
      .then((res) => {
        //1-0
      });
  });

  it(`(POST: /pair-game-quiz/pairs/my-current/answers send answer by user1"  )`, () => {
    return request(app.getHttpServer())
      .post("/pair-game-quiz/pairs/my-current/answers")
      .send(JSON.stringify(correctAnswer))
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("user-Agent", "deviceTitle")
      .set("Authorization", `Bearer ${users[1].accessToken}`)
      .expect(200)
      .then((res) => {
        //1-1
      });
  });

  it(`(POST: /pair-game-quiz/pairs/my-current/answers send answer by user0"  )`, () => {
    return request(app.getHttpServer())
      .post("/pair-game-quiz/pairs/my-current/answers")
      .send(JSON.stringify(correctAnswer))
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("user-Agent", "deviceTitle")
      .set("Authorization", `Bearer ${users[0].accessToken}`)
      .expect(200)
      .then((res) => {
        //2-1
      });
  });

  it(`(POST: /pair-game-quiz/pairs/my-current/answers send answer by user0"  )`, () => {
    return request(app.getHttpServer())
      .post("/pair-game-quiz/pairs/my-current/answers")
      .send(JSON.stringify(correctAnswer))
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("user-Agent", "deviceTitle")
      .set("Authorization", `Bearer ${users[0].accessToken}`)
      .expect(200)
      .then((res) => {
        //3-1
      });
  });

  it(`(POST: /pair-game-quiz/pairs/my-current/answers send answer by user1"  )`, () => {
    return request(app.getHttpServer())
      .post("/pair-game-quiz/pairs/my-current/answers")
      .send(JSON.stringify(correctAnswer))
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("user-Agent", "deviceTitle")
      .set("Authorization", `Bearer ${users[1].accessToken}`)
      .expect(200)
      .then((res) => {
        //3-2
      });
  });

  it(`(POST: /pair-game-quiz/pairs/my-current/answers send answer by user1"  )`, () => {
    return request(app.getHttpServer())
      .post("/pair-game-quiz/pairs/my-current/answers")
      .send(JSON.stringify(correctAnswer))
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("user-Agent", "deviceTitle")
      .set("Authorization", `Bearer ${users[1].accessToken}`)
      .expect(200)
      .then((res) => {
        //3-3
      });
  });

  it(`(POST: /pair-game-quiz/pairs/my-current/answers send answer by user0"  )`, () => {
    return request(app.getHttpServer())
      .post("/pair-game-quiz/pairs/my-current/answers")
      .send(JSON.stringify(incorrectAnswer))
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("user-Agent", "deviceTitle")
      .set("Authorization", `Bearer ${users[0].accessToken}`)
      .expect(200)
      .then((res) => {
        //3-3
      });
  });

  it(`(POST: /pair-game-quiz/pairs/my-current/answers send answer by user0"  )`, () => {
    return request(app.getHttpServer())
      .post("/pair-game-quiz/pairs/my-current/answers")
      .send(JSON.stringify(correctAnswer))
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("user-Agent", "deviceTitle")
      .set("Authorization", `Bearer ${users[0].accessToken}`)
      .expect(200)
      .then((res) => {
        //4-3
      });
  });

  it(`(POST: /pair-game-quiz/pairs/my-current/answers send answer by user0"  )`, () => {
    return request(app.getHttpServer())
      .post("/pair-game-quiz/pairs/my-current/answers")
      .send(JSON.stringify(incorrectAnswer))
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("user-Agent", "deviceTitle")
      .set("Authorization", `Bearer ${users[1].accessToken}`)
      .expect(200)
      .then((res) => {
        //4-3
      });
  });

  it(`(GET: /pair-game-quiz/pairs/my-current by user0"  )`, () => {
    return request(app.getHttpServer())
      .get("/pair-game-quiz/pairs/my-current")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("user-Agent", "deviceTitle")
      .set("Authorization", `Bearer ${users[0].accessToken}`)
      .expect(404)
      .then((res) => {
        // console.dir(users[0].accessToken);
        // console.log(gameId);
        // console.log(res.body);
      });
  });

  it(`(GET: /pair-game-quiz/pairs/my-current by user0"  )`, () => {
    return request(app.getHttpServer())
      .get("/pair-game-quiz/pairs/my?sortBy=status&sortDirection=asc")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("user-Agent", "deviceTitle")
      .set("Authorization", `Bearer ${users[0].accessToken}`)
      .expect(200)
      .then((res) => {
        // console.dir(users[0].accessToken);
        // console.log(gameId);
        console.log(res.body);
      });
  });
});
