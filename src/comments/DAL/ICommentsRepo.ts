import { PaginationBasicDto } from "../dto/paginationBasicDto";
import { CommentToRepoDTO } from "../dto/CommentToRepoDTO";
import { CommentViewPublicDTO } from "../dto/CommentViewPublicDTO";
import { UserEntity } from "../../users/entity/user.entity";
import { CommentViewForBloggerDTO } from "../../bloggers/dto/CommentViewForBloggerDTO";

export const ICommentsRepoToken = Symbol("ICommentsRepoToken");

export interface ICommentsRepo<GenericCommentType> {
  createComment(comment: CommentToRepoDTO): Promise<GenericCommentType>;

  findCommentById(commentId: string): Promise<GenericCommentType | null>;

  getCommentsByPost(
    postId: string,
    dto: PaginationBasicDto,
  ): Promise<GenericCommentType[]>;

  updateComment(commentId: string, content: string);

  deleteComment(commentId: string);

  countCommentsOnPost(postId: string, dto: PaginationBasicDto): Promise<number>;

  getAllCommentsByBlog(
    userId: string,
    dto: PaginationBasicDto,
  ): Promise<GenericCommentType[]>;

  mapCommentsToResponsePublic(
    allComments: GenericCommentType[],
    user: UserEntity | null,
  ): Promise<CommentViewPublicDTO[]>;

  mapCommentToResponsePublic(
    comment: GenericCommentType,
    user: UserEntity | null,
  ): Promise<CommentViewPublicDTO>;

  countAllCommentsForAllUserBlogs(userId: string): Promise<number>;

  mapCommentsToResponseForBlogger(
    allComments: GenericCommentType[],
  ): Promise<CommentViewForBloggerDTO[]>;

  mapCommentToResponseForBlogger(
    comment: GenericCommentType,
  ): Promise<CommentViewForBloggerDTO>;
}
