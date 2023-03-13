import { PaginationBasicDto } from "../dto/paginationBasicDto";
import { BlogsPaginationDto } from "../../bloggers/dto/blogsPaginationDto";
import { CommentToRepoDTO } from "../dto/CommentToRepoDTO";
import { CommentViewPublicDTO } from "../dto/CommentViewPublicDTO";

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

  getAllCommentByBlog(
    userId: string,
    dto: BlogsPaginationDto,
  ): Promise<GenericCommentType[]>;

  mapCommentsToResponsePublic(
    allComments: GenericCommentType[],
  ): Promise<CommentViewPublicDTO[]>;

  mapCommentToResponsePublic(
    comment: GenericCommentType,
  ): Promise<CommentViewPublicDTO>;

  countAllCommentsForAllUserBlogs(userId: string): Promise<number>;

  mapCommentsToResponse(
    allComments: GenericCommentType[],
  ): Promise<CommentViewPublicDTO[]>;
}
