import { Injectable } from "@nestjs/common";
import { LikesSQLRepo } from "./likes.SQL.repo";
import { LikeStatusEnum } from "../../likes/LikeStatusEnum";
import { ALikeService } from "./ILikeService";

@Injectable()
export class LikesSQLService implements ALikeService {
  constructor(protected readonly likesRepo: LikesSQLRepo) {}

  async addReactionToPost(
    userId: string,
    postId: string,
    likeStatus: LikeStatusEnum,
  ) {
    return await this.likesRepo.addReactionToPost(userId, postId, likeStatus);
  }

  async addReactionToComment(
    userId: string,
    commentId: string,
    likeStatus: LikeStatusEnum,
  ) {
    return await this.likesRepo.addReactionToComment(
      userId,
      commentId,
      likeStatus,
    );
  }

  async getPostLikeInfo(userId: string, postId: string) {
    const reactionsOnPost = await this.likesRepo.getPostLikeInfo(
      userId,
      postId,
    );
    const likesDislikes = reactionsOnPost.map((r) => {
      return { [r.reaction]: r.count };
    });
    const lastThreeLikes = await this.likesRepo.getLastLikesOnPost(
      userId,
      postId,
    );
    const myStatus = await this.likesRepo.getUserLikeStatusPost(userId, postId);
    const res = {
      likesCount:
        likesDislikes.filter((el) => Object.keys(el)[0] == "Like")[0]?.Like ||
        "0",
      dislikesCount:
        likesDislikes.filter((el) => Object.keys(el)[0] == "Dislike")[0]
          ?.Dislike || "0",
      myStatus: userId ? myStatus[0]?.reaction || "None" : "None",
      newestLikes: lastThreeLikes,
    };
    return res;
  }

  async getCommentLikeInfo(userId: string, commentId: string) {
    const reactionsOnComment = await this.likesRepo.getCommentLikeInfo(
      userId,
      commentId,
    );
    const likesDislikes = reactionsOnComment.map((r) => {
      return { [r.reaction]: r.count };
    });
    const myStatus = await this.likesRepo.getUserLikeStatusComment(
      userId,
      commentId,
    );
    const res = {
      likesCount:
        likesDislikes.filter((el) => Object.keys(el)[0] == "Like")[0]?.Like ||
        "0",
      dislikesCount:
        likesDislikes.filter((el) => Object.keys(el)[0] == "Dislike")[0]
          ?.Dislike || "0",
      myStatus: userId ? myStatus[0]?.reaction || "None" : "None",
    };
    return res;
  }
}
