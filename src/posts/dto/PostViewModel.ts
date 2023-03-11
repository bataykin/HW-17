import { LikeStatusEnum } from "../../likes/LikeStatusEnum";

export class PostViewModel {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatusEnum;
    newestLikes: {
      addedAt: Date;
      userId: string;
      login: string;
    }[];
  };
}
