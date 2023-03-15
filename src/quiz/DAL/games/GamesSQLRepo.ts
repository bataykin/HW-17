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
    const pendingGame = await this.dataSource.query(`
      select games.* from games
      where games."status" = "${GameStatusEnum.PendingSecondPlayer}" 
      and games."firstPlayerId" != '${user.id}'
    `);
    if (!pendingGame) {
      const newGame = await this.dataSource.query(`
        insert into games
        ("firstPlayerId", "status")
        values ("${user.id}", "${GameStatusEnum.PendingSecondPlayer}")
        returning *
      `);
      return newGame[0] ?? null;
    } else {
      // TODO set 5 questions to game
      const questions = await this.dataSource.query(`
      select floor(random() * ( select count(*) from questions)) + 1
      `);
      const game = await this.dataSource.query(
        `
        update games set 
         "secondPlayerId" = "${user.id}",
         "status" = "${GameStatusEnum.Active}",
         "startGameDate" = $1
        where status = '${GameStatusEnum.PendingSecondPlayer} ' 
        returning *
      `,
        [new Date()],
      );
      return game[0] ?? null;
    }
  }

  async getCurrentGame(user: UserEntity): Promise<GameEntity> {
    return Promise.resolve(undefined);
  }

  async getGameById(user: UserEntity, gameId: string): Promise<GameEntity> {
    return Promise.resolve(undefined);
  }

  async sendAnswer(
    user: UserEntity,
    game: GameEntity,
    question: QuestionEntity,
    answerStatus: AnswerStatusEnum,
  ): Promise<AnswerViewModel> {
    const setAnswer = await this.dataSource.query(`
     insert into answers
     ("gameId", "playerId", "questionId", "answerStatus")
      values ("${game.id}", "${user.id}", "${question.id}", "${answerStatus}") 
      returning *
    `);
    // const checkUnanswered = await this.dataSource.query(`
    //   select * from answers
    //   where "gameId" = "${game.id} and "playerId" = "${user.id}"
    // `);

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
      where status = "${GameStatusEnum.Active}" and
      ("firstPlayerId" = "${user.id}" or "secondPlayerId" = "${user.id}")
    `);
    return activeGame[0] ?? null;
  }

  async mapGameToView(game: GameEntity): Promise<GameViewModel> {
    const gameView: GameViewModel = {
      id: game.id,
      firstPlayerProgress: {
        answers: [],
        player: {
          id: game.firstPlayerId,
          login: "",
        },
        score: 0,
      },
      secondPlayerProgress: {
        answers: [],
        player: {
          id: game.secondPlayerId,
          login: "",
        },
        score: 0,
      },
      questions: [],
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
    where id = "${game.id}"
    `);
    const answeredQuestions = await this.dataSource.query(`
    select "questionId"
    from answers
    where "gameId" = "${game.id}" and "playerId" = "${user.id}"
    `);
    const notAnsweredQuestions = allQuestions.filter(
      (q) => !(q in answeredQuestions),
    );
    const lastQuestion = await this.dataSource.query(`
      select * from questions
      where id = "${notAnsweredQuestions[0].questionId}"
    `);
    return lastQuestion[0] ?? null;
  }

  async checkAnswer(
    question: QuestionEntity,
    answer: AnswerInputModel,
  ): Promise<AnswerStatusEnum> {
    if (answer.answer in question.correctAnswers) {
      return AnswerStatusEnum.Correct;
    } else return AnswerStatusEnum.Incorrect;
  }
}
