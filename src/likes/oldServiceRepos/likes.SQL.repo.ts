import {BadRequestException, Injectable} from "@nestjs/common";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {LikeStatusEnum} from "../../comments/comment.schema";
import {use} from "passport";

@Injectable()
export class LikesSQLRepo {
    constructor(@InjectDataSource()
                private readonly dataSource: DataSource,) {
    }


    async addReactionToPost(userId: string, postId: string, likeStatus: LikeStatusEnum) {
        return this.dataSource.query(`
            INSERT INTO likes ("userId", "postId", reaction)
                VALUES ($1, $2, $3)
                ON CONFLICT ON CONSTRAINT PK_LIKES_USER_POST
                DO UPDATE SET reaction = $3
                RETURNING *
                    `, [userId, postId, likeStatus])
    }

    async addReactionToComment(userId: string, commentId: string, likeStatus: LikeStatusEnum) {
        return this.dataSource.query(`
            INSERT INTO likes ("userId", "commentId", reaction)
                VALUES ($1, $2, $3)
                ON CONFLICT ON CONSTRAINT PK_LIKES_USER_COMMENT
                DO UPDATE SET reaction = $3
                RETURNING *
                    `, [userId, commentId, likeStatus])
    }


    async getPostLikeInfo(userId: string, postId: string) {
        const counts = await this.dataSource.query(`
                SELECT reaction,
                COUNT(*) 
                FROM likes
                WHERE "postId" = $1 
                GROUP BY reaction
        `, [postId])
        return counts
    }

    async getCommentLikeInfo(userId: string, commentId: string) {
        const counts = await this.dataSource.query(`
                SELECT reaction,
                COUNT(*) 
                FROM likes
                WHERE "commentId" = $1 
                GROUP BY reaction
        `, [commentId])
        return counts
    }

    async getLastLikesOnPost(userId: string, postId: string) {
        const last3 = await this.dataSource.query(`
                SELECT l."addedAt", l."userId", u.login
                FROM likes AS l
                JOIN users AS u
                ON l."userId" = u.id
                WHERE l."postId" = $1 AND l.reaction = $2
                ORDER BY l."addedAt" DESC
                LIMIT 3
        `, [postId, 'Like'])
        return last3
    }

    async getUserLikeStatusPost(userId: string, postId: string) {
        const status = await this.dataSource.query(`
                SELECT reaction
                FROM likes
                WHERE "postId" = $1 AND "userId" = $2
        `, [postId, userId])
        return status
    }


    async getUserLikeStatusComment(userId: string, commentId: string) {
        const status = await this.dataSource.query(`
                SELECT reaction
                FROM likes
                WHERE "commentId" = $1 AND "userId" = $2
        `, [commentId, userId])

        return status

    }


}

