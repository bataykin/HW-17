import { LikeStatusEnum } from "../../likes/LikeStatusEnum";
import { IsUUID } from "class-validator";

export class CommentViewPublicDTO {
  @IsUUID()
  id: string;

  content: string;

  commentatorInfo: {
    userId: string;
    userLogin: string;
  };

  createdAt: Date;

  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatusEnum;
  };
}
