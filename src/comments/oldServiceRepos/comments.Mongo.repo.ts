import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, UpdateQuery } from "mongoose";
import { Comment, CommentDocument, LikeStatusEnum } from "../comment.schema";

@Injectable()
export class CommentsMongoRepo {
    constructor(@InjectModel(Comment.name) private commentModel: Model<CommentDocument> ) {
    }


    async findById(id: string) {
        return this.commentModel.findById(id)
    }

    async createComment(comment: { userLogin: string; addedAt: Date; userId: string; content: string; likesInfo: { likesCount: number; dislikesCount: number; myStatus: string } }) {
        return this.commentModel.insertMany(comment)
    }

    async getCommentsByPost(postId: string, skipSize: number, PageSize: number) {
        return await this.commentModel.find({postId: postId}).skip(skipSize).limit(PageSize).exec();
    }

    async countDocuments(filter: FilterQuery<any> ) {
        return this.commentModel.countDocuments(filter);
    }

    async updateComment(commentId: string, content: string) {
        return this.commentModel.findByIdAndUpdate(commentId, {content: content}, {new: true});
    }

    async deleteComment(commentId: string) {
        return this.commentModel.findByIdAndDelete(commentId)
    }

    async setLikeStatus(commentId: string, updateQuery: UpdateQuery<any>) {
        return this.commentModel.findByIdAndUpdate(commentId, updateQuery, {new: true})
    }

    async getMyLikeInfo(userId: string, commentId: string) {
        return this.commentModel.findOne({$and: [{userId: userId}, {_id: commentId}] }).select({_id: 0, likesInfo: 1})
    }

    async updateCommentWithLike(commentId: string, totalLikes: number, totalDislikes: number, likeStatus: LikeStatusEnum) {
        return this.commentModel.findByIdAndUpdate(commentId,
            {
                'likesInfo.likesCount': totalLikes,
                'likesInfo.dislikesCount': totalDislikes,
                'likesInfo.myStatus': 'None',
            },
            {new: true})
    }

}