import {Injectable} from "@nestjs/common";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {use} from "passport";

@Injectable()
export class QuizSQLRepo {
    constructor(@InjectDataSource()
                private readonly dataSource: DataSource) {
    }


    async getPendingGame() {
        const gameId = await this.dataSource.query(`
                    SELECT id 
                    FROM games 
                    WHERE status = $1
        `, ['PendingSecondPlayer'])
        return gameId
    }

    async createNewPlayer(userId: number) {
        const player  = await this.dataSource.query(`
                INSERT INTO players
                (answers, "userId", score)
                VALUES ($1, $2, $3)
                RETURNING *
        `, [[], userId, 0])
        return player
    }

    async createNewGame(firstPlayerId: string) {

        // get 5 question by using date
        const fiveRandomQuestions = await this.dataSource.query(`
                    SELECT id, question 
                    FROM questions 
                    ORDER BY "lastUsedAt" ASC
                    LIMIT 5
        `, [])

        // update usedAt date for next sort retrieving questions
        for (let i = 0; i < fiveRandomQuestions.length; i++) {
            await this.dataSource.query(`
                    UPDATE question 
                    SET "lastUsedAt" = NOW() 
                    WHERE id = $1
        `, [fiveRandomQuestions[i].id])
        }

        // create new game;
        const game  = await this.dataSource.query(`
                INSERT INTO games
                ("firstPlayer", questions, status)
                VALUES ($1, $2, $3)
                RETURNING id
        `, [firstPlayerId, fiveRandomQuestions, 'PendingSecondPlayer'])


        return game

    }

    async connectGame(gameId: string, playerId: number) {
        const game =  await this.dataSource.query(`
                    UPDATE games  
                    SET "secondPlayer" = $1,
                    status = $2, 
                    "startGameDate" = NOW()
                    WHERE id = $3
                    RETURNING id
        `, [playerId, 'Active', gameId])


        return game
    }

    async isAlreadyPlay(userId: number) {
        const activePlayer = await this.dataSource.query(`
                    SELECT p."userId", g.status, g.id as "gameId"
                    FROM games g
                     JOIN players p ON p.id  = g."firstPlayer" OR p.id = g."secondPlayer"
                    WHERE 
                    ((g.status IN  ('PendingSecondPlayer', 'Active'))
                    AND (p."userId" = $1))
                    LIMIT 1
        `, [userId])
        return activePlayer
    }

    async getGameById(gameId: string) {
        const activeGame = await this.dataSource.query(`
                    SELECT 
                    g.id,
                    CASE
                        WHEN p.id  = g."firstPlayer" THEN u.login
                    END AS "firstPlayer",
                    CASE
                        WHEN p.id  = g."secondPlayer" THEN u.login
                    END AS "secondPlayer",
                    p."userId",
                    p.answers,
                    p.score,
                    questions,
                    g."pairCreatedDate",
                    g."startGameDate",
                    g."finishGameDate",
                    g.status
                    

                    FROM games g
                     JOIN players p ON p.id  = g."firstPlayer" OR p.id = g."secondPlayer"
                     JOIN users u ON p."userId" = u.id
                    WHERE 
                    ((g.status IN  ('PendingSecondPlayer', 'Active'))
                    AND (g.id = $1))
        `, [ gameId ])
        return activeGame
    }

    async getAllMyGames(userId: number) {
        const myGames = await this.dataSource.query(`
                    SELECT g.id AS "gameId"
                    FROM games g
                     JOIN players p ON p.id  = g."firstPlayer" OR p.id = g."secondPlayer"
                    WHERE p."userId" = $1
        `, [ userId ])
        return myGames
    }


    async getTopUsers(topX: number) {
        const myGames = await this.dataSource.query(`
                    SELECT u.id ,u.login, 
                    SUM(p.score) as "sumScore",
                    COUNT(p.score) as "gamesCount",
                    SUM(p.score) /  COUNT(p.score) as "avgScores"
                    
                    FROM users u
                    JOIN players p ON p."userId"  = u.id
                    JOIN games g ON p.id  = g."firstPlayer" OR p.id = g."secondPlayer"
                    GROUP BY u.id, g.id
                    ORDER  BY "sumScore"
                    LIMIT $1
        `, [ topX ])
        return myGames
    }

    async getMyActiveGame(userId: number) {
        const gameId = await this.dataSource.query(`
                    SELECT g.id 
                    FROM games g
                    JOIN players p ON p.id  = g."firstPlayer" OR p.id = g."secondPlayer"
                    WHERE status = $1 AND p."userId" = $2
        `, ['Active', userId])
        return gameId
    }

    async getMyAnswers(gameId: number, userId: number) {
        const answers = await this.dataSource.query(`
                    SELECT p.answers 
                    FROM games g
                    JOIN players p ON p.id  = g."firstPlayer" OR p.id = g."secondPlayer"
                    WHERE g.id = $1 AND p."userId" = $2
        `, [gameId, userId])
        return answers
    }

    async checkAnswer(id, userId: number, answer: string) {

        
    }

    async getGameQuestions(gameId:number) {
        const questions = await this.dataSource.query(`
                    SELECT q.id, q.question, q.answer 
                    FROM games g
                    JOIN questions q
                    ON q.id = ANY (g.questions)
                    WHERE g.id = $1
        `, [gameId])
        return questions
    }

    async getMyUnansweredQuestions(gameId, userId: number) {
        const x = await this.dataSource.query(`
                    SELECT q.id, q.question, q.answer, p.id AS "playerId"
                    FROM games g
                    JOIN questions q
                    ON q.id = ANY (g.questions)
                    LEFT JOIN (
                    SELECT p.answers 
                    FROM games g
                    JOIN players p ON p.id  = g."firstPlayer" OR p.id = g."secondPlayer"
                    WHERE g.id = $1 AND p."userId" = $2
                    ) as ans
                    ON q.id = ANY (ans.answers)

        `, [gameId, userId])
        return x
    }

    async saveAnswer(gameId: number, playerId: number, questionId: number, answerStatus: string) {
        const answer  = await this.dataSource.query(`
                INSERT INTO answers
                ("gameId", "playerId", "questionId", "answerStatus")
                VALUES ($1, $2, $3, $4)
                RETURNING id
        `, [gameId, playerId, questionId, answerStatus])

    }
}