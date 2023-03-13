import { IsUUID } from "class-validator";

export class CommentToRepoDTO {
  content: string;

  @IsUUID()
  userId: string;

  userLogin: string;

  @IsUUID()
  postId: string;
}
