import { LikeStatusEnum } from "../LikeStatusEnum";
import { PostEntity } from "../../posts/entities/post.entity";
import { CommentEntity } from "../../comments/entities/comment.entity";

export const ILikesRepoToken = Symbol("ILikesRepoToken");

export interface ILikesRepo<GenericRepoType> {
  addReactionToComment(
    userId: string,
    commentId: string,
    likeStatus: LikeStatusEnum,
  );

  setLikeStatusToPost(
    userId: string,
    postId: string,
    likeStatus: LikeStatusEnum,
  );

  getCommentLikeStatus(userId: string, commentId: string);

  getPostLikeStatus(userId: string, postId: string);

  getUserLikeStatusPost(userId: string, postId: string);

  getUserLikeStatusComment(userId: string, commentId: string);

  getCommentLikeDislikeCounts(id: string);

  getPostLikeDislikeCounts(postId: string);

  getLastLikesOnPost(postId: string);

  mapLikesToPostEntityToResponse(post: PostEntity, userId?: string);

  mapArrayPostEntitiesToResponse(posts: PostEntity[], userId?: string);

  mapLikesToCommentEntityToResponse(comment: CommentEntity, userId: string);

  mapCommentsToResponsePublic(comments: CommentEntity[], userId?: string);
}
