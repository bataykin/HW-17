import {Injectable} from "@nestjs/common";
import {LikeStatusEnum} from "../../comments/comment.schema";
import {InjectRepository} from "@nestjs/typeorm";
import {BlogEntity} from "../../bloggers/entities/blogEntity";
import {Repository} from "typeorm";
import {LikeEntity} from "../entities/like.entity";
import {count} from "rxjs";
import {UserEntity} from "../../users/entity/user.entity";

@Injectable()
export class LikesORMRepo{
    constructor(@InjectRepository(LikeEntity)
                private readonly likesRepository: Repository<LikeEntity>,
    ) {
    }

    async addReactionToComment(userId: string, commentId: string, likeStatus: LikeStatusEnum) {

        const result = await this.likesRepository.manager.upsert(LikeEntity,
            {
                userId: userId,
                commentId: commentId,
                reaction: likeStatus,
            },
            ["userId", "commentId"])
        return result
    }

    async addReactionToPost(userId: string, postId: string, likeStatus: LikeStatusEnum) {
        const result = await this.likesRepository.upsert(
            {
                userId: userId,
                postId: postId,
                reaction: likeStatus,
            },
            ["userId", "postId"])

        return result
    }

    async getCommentLikeInfo(userId: string, commentId: string) {
        const res = await this.likesRepository.findBy({
            commentId: commentId
        })

        // const result = this.likesRepository.createQueryBuilder()
        //     .select('reaction')
        //     .loadRelationCountAndMap('likesCount', 'reaction')
        //     .where({"commentId = :commentId": {commentId}})
        //     .groupBy('reaction')
        return res
    }

    async getUserLikeStatusComment(userId: string, commentId: string) {
        const res = await this.likesRepository.findBy({
            commentId: commentId
        })
        // const result = this.likesRepository.createQueryBuilder()
        //     .select('reaction')
        //     .where({"commentId = :commentId": {commentId}})
        //     .andWhere({"userId = :userId": {userId}})
        return res
    }

    async getPostLikeInfo(userId: string, postId: string) {
        const result = this.likesRepository.createQueryBuilder()
            .select('reaction')
            .loadRelationCountAndMap('likesCount', 'reaction')
            .where({"postId = :postId": {postId}})
            .groupBy('reaction')
        return result
    }

    async getLastLikesOnPost(userId: string, postId: string) {
        const result = this.likesRepository.createQueryBuilder('likes')
            .leftJoinAndSelect('users.id', 'users')

        return result
    }

    async getUserLikeStatusPost(userId: string, postId: string) {
        const result = this.likesRepository.createQueryBuilder()
            .select('reaction')
            .where({"postId = :postId": {postId}})
            .andWhere({"userId = :userId": {userId}})
        return result

    }
}