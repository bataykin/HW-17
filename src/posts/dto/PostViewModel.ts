import { LikeStatusEnum } from "../../likes/LikeStatusEnum";
import { ImageMetaView } from "../../bloggers/dto/ImagesViewModel";

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
  images: {
    main: ImageMetaView[];
  };
}
