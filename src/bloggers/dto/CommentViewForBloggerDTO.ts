import { IsUUID } from "class-validator";

export class CommentViewForBloggerDTO {
  @IsUUID()
  id: string;

  content: string;

  commentatorInfo: {
    userId: string;
    userLogin: string;
  };

  createdAt: Date;

  postInfo: {
    id: string;
    title: string;
    blogId: string;
    blogName: string;
  };
}
