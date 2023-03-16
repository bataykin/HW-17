import { IGamesRepo } from "./IGamesRepo";
import { GameEntity } from "./GameEntity";
import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { UserEntity } from "../../../users/entity/user.entity";
import { AnswerInputModel } from "../../dto/game/AnswerInputModel";
import { GameStatusEnum } from "../../dto/game/GameStatusEnum";
import { GameViewModel } from "../../dto/game/GameViewModel";
import { AnswerStatusEnum } from "../../dto/game/AnswerStatusEnum";
import { AnswerViewModel } from "../../dto/game/AnswerViewModel";
import { QuestionEntity } from "../questions/QuestionEntity";

@Injectable()
export class GamesSQLRepo implements IGamesRepo<GameEntity> {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async connectToGame(user: UserEntity): Promise<GameEntity> {
    //check that game already exists:
    const pendingGame = await this.dataSource.query(`
      select * from games
      where "status" = '${GameStatusEnum.PendingSecondPlayer}' 
    `);

    // if no existed pending game, then create:
    if (pendingGame.length == 0) {
      const newGame = await this.dataSource.query(`
        insert into games
        ("firstPlayerId", "status")
        values ('${user.id}', '${GameStatusEnum.PendingSecondPlayer}')
        returning *
      `);
      return newGame[0] ?? null;
    }

    // if pending game is existed then connect and start game:
    else {
      if (pendingGame[0].firstPlayerId == user.id) {
        return pendingGame[0];
      }

      const questions = await this.dataSource.query(`
        select * from questions
      `);
      // Shuffle array
      const shuffled = questions.sort(() => 0.5 - Math.random());
      // Get sub-array of first 5 elements after shuffled
      let selected = shuffled.slice(0, 5);

      const game = await this.dataSource.query(
        `
        update games set 
         "secondPlayerId" = '${user.id}',
         "status" = '${GameStatusEnum.Active}',
         "startGameDate" = $1,
         "questions" = $2
        where id = '${pendingGame[0].id}'
        returning *
      `,
        [new Date(), selected],
      );
      return game[0][0] ?? null;
    }
  }

  async getCurrentGame(user: UserEntity): Promise<GameEntity> {
    const curGame = await this.dataSource.query(`
      select * from games
      where 
      (status = '${GameStatusEnum.Active}' or status = '${GameStatusEnum.PendingSecondPlayer}')
       and
      ("firstPlayerId" = '${user.id}' or "secondPlayerId" = '${user.id}')
    `);
    return curGame[0] ?? null;
  }

  async getGameById(gameId: string): Promise<GameEntity> {
    const game = await this.dataSource.query(`
      select * from games
      where id = '${gameId}' 
    `);
    return game[0] ?? null;
  }

  async sendAnswer(
    user: UserEntity,
    game: GameEntity,
    question: QuestionEntity,
    answerStatus: AnswerStatusEnum,
    answer: string,
  ): Promise<AnswerViewModel> {
    const setAnswer = await this.dataSource.query(`
     insert into answers
     ("gameId", "playerId", "questionId", "answerStatus", "answer")
      values ('${game.id}', '${user.id}', '${question.id}', '${answerStatus}', '${answer}') 
      returning *
    `);
    // const checkUnanswered = await this.dataSource.query(`
    //   select * from answers
    //   where "gameId" = "${game.id} and "playerId" = "${user.id}"
    // `);
    // console.log(setAnswer);

    // TODO ???
    return {
      questionId: question.id,
      answerStatus: answerStatus,
      addedAt: setAnswer[0].addedAt ?? new Date(),
    };
  }

  async getActiveGame(user: UserEntity): Promise<GameEntity> {
    const activeGame = await this.dataSource.query(`
      select * from games
      where status = '${GameStatusEnum.Active}' and
      ("firstPlayerId" = '${user.id}' or "secondPlayerId" = '${user.id}')
    `);
    return activeGame[0] ?? null;
  }

  async mapGameToView(game: GameEntity): Promise<GameViewModel> {
    //
    const mappedQuestions = game.questions
      ? await this.mapQuestionsToView(game.questions)
      : null;

    const getUserLogin = async (id: string) => {
      if (!id) return null;
      const login = await this.dataSource.query(
        `
        select * from users
        where id = '${id}'
        `,
      );
      return login[0]?.login;
    };

    const getUserAnswers = async (userId) => {
      if (!userId) return [];
      const answers = await this.dataSource.query(`
      select "questionId", "answerStatus", "addedAt"
       from answers
      where "gameId" = '${game.id}' and "playerId" = '${userId}'`);
      return answers;
    };

    const gameView: GameViewModel = {
      id: game.id,
      firstPlayerProgress: {
        answers: await getUserAnswers(game.firstPlayerId),
        player: {
          id: game.firstPlayerId,
          login: await getUserLogin(game.firstPlayerId),
        },
        score: game.firstPlayerScore ? game.firstPlayerScore : 0,
      },
      secondPlayerProgress: game.secondPlayerId
        ? {
            answers: await getUserAnswers(game.secondPlayerId),
            player: {
              id: game.secondPlayerId,
              login: await getUserLogin(game.secondPlayerId),
            },
            score: game.secondPlayerScore ? game.secondPlayerScore : 0,
          }
        : null,
      questions: mappedQuestions,
      status: game.status as GameStatusEnum,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: game.startGameDate,
      finishGameDate: game.finishGameDate,
    };
    return gameView;
  }

  async getLastQuestion(
    game: GameEntity,
    user: UserEntity,
  ): Promise<QuestionEntity> {
    const allQuestions = await this.dataSource.query(`
    select questions
    from games
    where id = '${game.id}'
    `);
    const gameQuestions = allQuestions[0].questions;

    const answeredQuestions = await this.dataSource.query(`
    select "questionId"
    from answers
    where "gameId" = '${game.id}' and "playerId" = '${user.id}'
    `);
    const answeredId = answeredQuestions.map((q) => q.questionId);
    const gameQId = gameQuestions.map((q) => q.id);
    const notAnsQId = gameQId.filter((id) => answeredId.indexOf(id) == -1);
    if (notAnsQId.length == 0) return null;

    const lastQuestion = await this.dataSource.query(`
      select * from questions
      where id = '${notAnsQId[0]}'
    `);
    // console.log(lastQuestion);
    return lastQuestion[0] ?? null;
  }

  async mapQuestionToView(
    question: QuestionEntity,
  ): Promise<{ id: string; body: string }> {
    return { id: question.id, body: question.body };
  }

  async mapQuestionsToView(
    questions: QuestionEntity[],
  ): Promise<{ id: string; body: string }[]> {
    const mappedQuestions = [];
    for await (const question of questions) {
      mappedQuestions.push(await this.mapQuestionToView(question));
    }
    return mappedQuestions;
  }

  async checkAnswer(
    question: QuestionEntity,
    answer: AnswerInputModel,
  ): Promise<AnswerStatusEnum> {
    let res = "";
    // console.log(answer.answer, question.correctAnswers);
    const checkCorrectness = question.correctAnswers.filter(
      (ans) => answer.answer === ans,
    );

    if (checkCorrectness[0]) {
      res = AnswerStatusEnum.Correct;
    } else res = AnswerStatusEnum.Incorrect;
    // console.log(res, answer.answer, question.correctAnswers);
    return res as AnswerStatusEnum;
  }

  async calculateUserScore(user: UserEntity, game: GameEntity): Promise<void> {
    const score = await this.dataSource.query(`
    select * from answers
    where "gameId" = '${game.id}' and "playerId" = '${user.id}'
    and "answerStatus" = '${AnswerStatusEnum.Correct}'
    `);

    // console.log(score.length, score.length + 1);

    const getFirstAnsweredAll = await this.dataSource.query(`
    select * from games
    where id = '${game.id}'
    and
    ("firstPlayerScore" is null and "secondPlayerScore" is  null)
    `);
    // if user first answered to all questiong then he get plus 1 point
    if (getFirstAnsweredAll[0]) {
      console.log(getFirstAnsweredAll);
      await this.dataSource.query(`
      update games set 
      "firstPlayerScore" =
      case 
      when "firstPlayerId" = '${user.id}' then  ${
        score.length > 0 ? score.length + 1 : 0
      } 
      else 0 end,
      "secondPlayerScore" =
      case 
      when "secondPlayerId" = '${user.id}' then  ${
        score.length > 0 ? score.length + 1 : 0
      } 
      else 0 end
      where id = '${game.id}'
      `);
    } else {
      // calculate last player, finish game, detect winner

      //update scores
      await this.dataSource.query(
        `
      update games set 
      
      "firstPlayerScore" =
      case 
      when "firstPlayerId" = '${user.id}' then  ${score.length} 
      else "firstPlayerScore" end,
      
      "secondPlayerScore" =
      case 
      when "secondPlayerId" = '${user.id}' then  ${score.length} 
      else "secondPlayerScore" end,
      
      "status" = '${GameStatusEnum.Finished}',
      
      "finishGameDate" = $1
      
      where id = '${game.id}'
      `,
        [new Date()],
      );

      // detect winner
      await this.dataSource.query(`
      update games set 
      "winner" =
      case
      when "firstPlayerScore" > "secondPlayerScore" then  '${game.firstPlayerId}'
      when "firstPlayerScore" < "secondPlayerScore" then  '${game.secondPlayerId}'
      else 'draw' end
      where id = '${game.id}'
      `);
    }
    return;
  }
}
