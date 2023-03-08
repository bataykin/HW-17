import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { ACommentService } from "./ICommentService";
import { LikeStatusEnum } from "../comment.schema";
import { CommentsORMRepo } from "./comments.ORM.repo";
import { UsersORMRepo } from "../../users/oldServiceRepos/users.ORM.repo";
import { LikesORMService } from "../../likes/oldServiceRepos/likes.ORM.service";

@Injectable()
export class CommentsORMService implements ACommentService{
    constructor(protected readonly commentsRepo: CommentsORMRepo,
                protected readonly usersRepo: UsersORMRepo,
                protected readonly likesService: LikesORMService) {
    }
    async createCommentByPost(login: string, userId: string, postId: string, content: string): Promise<any> {
        const comment = {

            content: content,
            userId: userId,
            userLogin: login,
            addedAt: new Date(),
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: "None"
            },
            postId: postId
        }
        const createdComment = await this.commentsRepo.createComment(comment)
        //TODO uncomment
        // createdComment.likesInfo = comment.likesInfo

        return createdComment
    }

   async findCommentByIdOnUserId(commentId: string, userId: any): Promise<any> {
       const comment = await this.commentsRepo.findById(commentId)
       if (!comment) {
            throw new BadRequestException('commentId net takogo comment')
        }
        const UserReactionOnComment = await this.likesService.getCommentLikeInfo(userId, commentId)
       console.log(UserReactionOnComment)

        return comment
    }

   async  getCommentById(id: string, userId?: string): Promise<any> {
        const comment = await this.commentsRepo.findById(id)
        if (!comment) {
            throw new BadRequestException('commentId net takogo comment')
        }
        const UserReactionOnComment = await this.likesService.getCommentLikeInfo(userId, id)

        return comment
    }

    async getCommentsByPost(postId: string, PageSize: number, PageNumber: number): Promise<any> {
        const skipSize = (PageNumber > 1) ? (PageSize * (PageNumber - 1)) : 0
        const comments = await this.commentsRepo.getCommentsByPost(postId, skipSize, PageSize)

        const docCount = await this.commentsRepo.count()


        const result = {
            "pagesCount": Math.ceil(docCount / PageSize),
            "page": PageNumber,
            "pageSize": PageSize,
            "totalCount": docCount,
            "items": comments
        }
        return result
    }

    getCommentsByPostAuthUser(postId: string, userId: string, PageSize: number | 10, PageNumber: number | 1): any {
    }

   async  removeCommentById( commentId: string, userId?: string,): Promise<any> {
        const comment = await this.getCommentById(commentId)
        if (userId && (userId != comment.userId)) {
            throw new ForbiddenException('Hey, its not yours comment, dude))')
        }
        return await this.commentsRepo.deleteComment(commentId)
    }

    async setLikeStatus(userId: string, commentId: string, likeStatus: LikeStatusEnum): Promise<any> {
        return  await this.likesService.addReactionToComment(userId, commentId, likeStatus)
    }

    async updateCommentById (commentId: string, content: string, userId?: string): Promise<any> {
        const comment = await this.getCommentById(commentId)
        if (userId && (userId != comment.userId)) {
            throw new ForbiddenException('Hey, its not yours comment')
        }
        const updatedComment = await this.commentsRepo.updateComment(commentId, content)
        return updatedComment
    }

}