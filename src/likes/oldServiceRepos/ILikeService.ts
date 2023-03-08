import {LikeStatusEnum} from "../../comments/comment.schema";

export interface ILikeService {
    addReactionToPost(userId: string, postId: string, likeStatus: LikeStatusEnum): any,

    addReactionToComment(userId: string, commentId: string, likeStatus: LikeStatusEnum): any,

    getPostLikeInfo(userId: string, postId: string): any,

    getCommentLikeInfo(userId: string, commentId: string): any
}

export const ILikeServiceToken = Symbol("ILikeService")

export abstract class ALikeService {
   abstract addReactionToPost(userId: string, postId: string, likeStatus: LikeStatusEnum): any;

   abstract addReactionToComment(userId: string, commentId: string, likeStatus: LikeStatusEnum): any;

  abstract  getPostLikeInfo(userId: string, postId: string): any;

  abstract  getCommentLikeInfo(userId: string, commentId: string): any
}