import {BadRequestException, ForbiddenException, Injectable, NotFoundException} from "@nestjs/common";
import {QuizSQLRepo} from "./quiz.SQL.repo";
import {use} from "passport";
import {BlogsPaginationDto} from "../bloggers/dto/blogsPaginationDto";

@Injectable()
export class QuizSQLService {
    constructor(protected readonly quizRepo: QuizSQLRepo) {
    }

    async joinOrCreateGame(userId: number) {

// check that user is not already plays in existed games
        const alreadyPlay = await this.quizRepo.isAlreadyPlay(userId)
        if(alreadyPlay.length > 0 && alreadyPlay[0]?.userId == userId) {
            throw new ForbiddenException(`These userId = ${alreadyPlay[0]?.userId} already have game = ${alreadyPlay[0]?.gameId} session status "${alreadyPlay[0]?.status}", try other endpoint`)
        }

// check 'games' table for status = 'PendingSecondPlayer'       //[ PendingSecondPlayer, Active, Finished ]
        const pendingGame = await this.quizRepo.getPendingGame()

// if game with status = 'PendingSecondPlayer' NOT existed, then create new game
        if (pendingGame.length == 0) {
            const player = await this.quizRepo.createNewPlayer(userId)
            const newGame = await this.quizRepo.createNewGame(player[0].id)
            return {newGame: newGame[0].id,
                    firstPlayer_UserId: userId}
        } else {

// if game with status = 'PendingSecondPlayer' IS existed, then create new temporary player by userId and connect to game with new temp player
            const player = await this.quizRepo.createNewPlayer(userId)
            const connectGame = await this.quizRepo.connectGame(pendingGame[0].id, player[0].id)
            return {connectedGame: connectGame[0][0].id,
                    secondPlayer_userId: userId}
        }
    }

    async getGameById(userId: number, gameId: string) {
        const activeGame =  await this.quizRepo.getGameById( gameId)
        if (activeGame.length == 0) {
            throw new NotFoundException(`Game by id ${gameId} not exist`)
        } else if (activeGame[0].userId != userId && activeGame[1].userId != userId ) {
            throw new ForbiddenException('You try to access game where you are not plays, dude))')
        }
        const questionsId = activeGame[0].questions
        const res = {
            id: activeGame[0].id,
            firstPlayer: {
                answers: activeGame[0].answers,
                user: {
                    id: activeGame[0].userId,
                    login: activeGame[0].firstPlayer
                },
                score: activeGame[0].score
            },
            secondPlayer: {
                answers: activeGame[1].answers,
                user: {
                    id: activeGame[1].userId,
                    login: activeGame[1].secondPlayer
                },
                score: activeGame[1].score
            },
            questions: [],
            status: activeGame[0].status,
            pairCreatedDate: activeGame[0].pairCreatedDate,
            startGameDate: activeGame[0].startGameDate,
            finishGameDate: activeGame[0].finishGameDate
        }
        // delete activeGame[0].userId
        return res
    }

    async getAllMyGames(userId: number, {searchNameTerm = null, pageNumber = 1, pageSize = 10}: BlogsPaginationDto) {
        const skipSize = (pageNumber > 1) ? (pageSize * (pageNumber - 1)) : 0
        const myGames = await this.quizRepo.getAllMyGames(userId)
        const games = []
        for (let i = 0; i < myGames.length; i++) {
            games[i] = await this.packGameOutput(await this.quizRepo.getGameById(myGames[i].gameId))
        }
        const docCount = games.length

        const result = {
            "pagesCount": Math.ceil(docCount / pageSize),
            "page": pageNumber,
            "pageSize": pageSize,
            "totalCount": docCount,
            "items": games
        }
        return result
    }

    private async packGameOutput(activeGame: any) {
        const res = {
            id: activeGame[0].id,
            firstPlayer: {
                answers: [],
                user: {
                    id: activeGame[0].userId,
                    login: activeGame[0].firstPlayer
                },
                score: activeGame[0].score
            },
            secondPlayer: {
                answers: [],
                user: {
                    id: activeGame[1].userId,
                    login: activeGame[1].secondPlayer
                },
                score: activeGame[1].score
            },
            questions: [],
            status: activeGame[0].status,
            pairCreatedDate: activeGame[0].pairCreatedDate,
            startGameDate: activeGame[0].startGameDate,
            finishGameDate: activeGame[0].finishGameDate
        }
        return res
    }

    async getTopUsers({pageNumber = 1, pageSize = 10}: BlogsPaginationDto) {
        const skipSize = (pageNumber > 1) ? (pageSize * (pageNumber - 1)) : 0
        const topUsers = await this.quizRepo.getTopUsers(5)
        const docCount = topUsers.length
        const result = {
            "pagesCount": Math.ceil(docCount / pageSize),
            "page": pageNumber,
            "pageSize": pageSize,
            "totalCount": docCount,
            "items": topUsers
        }
        return result

        return topUsers
    }

    async sendAnswer(userId: number, answer: string) {
        // check active game
        const myActiveGame = await  this.quizRepo.getMyActiveGame(userId)
        if (myActiveGame.length == 0) {
            throw new ForbiddenException('Hey, you not in active pair now, check it out))')
        }
        // check sum answers <5
        // const myAnswers = await this.quizRepo.getMyAnswers(myActiveGame[0].id, userId)
        const notAnsweredQuestions = await this.quizRepo.getMyUnansweredQuestions(myActiveGame[0].id, userId)
        if (notAnsweredQuestions.length == 0) {
            throw new ForbiddenException('It seems that you already answered all questions')
        }
        // get questions for game
        // const myQuestions = await this.quizRepo.getGameQuestions(myActiveGame[0].id)
        // check answer in questions, get question id

        const correctQuestion = notAnsweredQuestions.filter(q => q.answer == answer )

        if (correctQuestion.length == 0) {
            // INCORRECT
            // save answer status to player
            await  this.quizRepo.saveAnswer(myActiveGame[0].id, notAnsweredQuestions[0].playerId, notAnsweredQuestions[0].id, 'Incorrect')

        }
        // check this question id is not already in my answers
        // const isCorrect = await this.quizRepo.checkAnswer(myActiveGame[0].id, userId, answer)
        return myActiveGame
    }
}