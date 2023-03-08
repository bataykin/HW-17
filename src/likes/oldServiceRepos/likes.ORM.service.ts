import {Injectable} from "@nestjs/common";
import {ALikeService} from "./ILikeService";
import {LikeStatusEnum} from "../../comments/comment.schema";
import {LikesORMRepo} from "./likes.ORM.repo";

@Injectable()
export class LikesORMService implements ALikeService {
    constructor(protected readonly likesRepo: LikesORMRepo) {
    }

   async addReactionToComment(userId: string, commentId: string, likeStatus: LikeStatusEnum): Promise<any> {
        return await this.likesRepo.addReactionToComment(userId, commentId, likeStatus)
    }

    async addReactionToPost(userId: string, postId: string, likeStatus: LikeStatusEnum): Promise<any> {
        return await this.likesRepo.addReactionToPost(userId, postId, likeStatus)
    }

    async getCommentLikeInfo(userId: string, commentId: string): Promise<any> {
        const reactionsOnComment = await this.likesRepo.getCommentLikeInfo(userId, commentId)
        // const likesDislikes = reactionsOnComment.map((r) => {return {[r.reaction]: r.count}})
        const likesDislikes = []
        const myStatus = await this.likesRepo.getUserLikeStatusComment(userId, commentId)
        const res = {
            "likesCount": likesDislikes.filter(el => Object.keys(el)[0] == 'Like')[0]?.Like || '0',
            "dislikesCount": likesDislikes.filter(el => Object.keys(el)[0] == 'Dislike')[0]?.Dislike || '0',
            "myStatus": (userId)? (myStatus[0]?.reaction || 'None') : 'None'
        }
        return res

    }

    async getPostLikeInfo(userId: string, postId: string): Promise<any> {
        // const reactionsOnPost = await this.likesRepo.getPostLikeInfo(+userId, +postId)
        // const likesDislikes = reactionsOnPost.map((r) => {return {[r.reaction]: r.count}})
        const likesDislikes = []
        const lastThreeLikes = await this.likesRepo.getLastLikesOnPost(userId, postId)
        const myStatus = await this.likesRepo.getUserLikeStatusPost(userId, postId)
        const res = {
            "likesCount": likesDislikes.filter(el => Object.keys(el)[0] == 'Like')[0]?.Like || '0',
            "dislikesCount": likesDislikes.filter(el => Object.keys(el)[0] == 'Dislike')[0]?.Dislike || '0',
            "myStatus": (userId)? (myStatus[0]?.reaction || 'None') : 'None',
            "newestLikes": lastThreeLikes
        }
        return res
    }

}