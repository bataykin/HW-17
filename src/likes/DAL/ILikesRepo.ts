import { LikeStatusEnum } from "../LikeStatusEnum";

export const ILikesRepoToken = Symbol("ILikesRepoToken");

export interface ILikesRepo<GenericRepoType> {
  setLikeStatusToComment(
    userId: string,
    commentId: string,
    likeStatus: LikeStatusEnum,
  );

  setLikeStatusToPost(
    userId: string,
    postId: string,
    likeStatus: LikeStatusEnum,
  );
}
