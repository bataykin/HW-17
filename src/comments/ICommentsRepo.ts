import { CreateCommentDto } from './dto/create-comment.dto';
import { PaginationCommentsDto } from './dto/paginationCommentsDto';
import { CommentEntity } from './entities/comment.entity';
import { BlogsPaginationDto } from '../bloggers/dto/blogsPaginationDto';
import { CommentViewDtoForBlogger } from './dto/commentViewDtoForBlogger';

export const ICommentsRepoToken = Symbol('ICommentsRepoToken');

export interface ICommentsRepo<GenericCommentType> {
  createComment(comment: CreateCommentDto): Promise<CommentEntity>;

  findCommentById(commentId: string);

  getCommentsByPost(postId: string, dto: PaginationCommentsDto);

  updateComment(commentId: string, content: string);

  deleteComment(commentId: string);

  countComments(postId: string);

  getAllCommentByBlog(
    userId: string,
    dto: BlogsPaginationDto,
  ): Promise<CommentEntity[]>;

  mapCommentsToResponse(
    allComments: CommentEntity[],
  ): Promise<CommentViewDtoForBlogger[]>;

  countAllCommentsForAllUserBlogs(userId: string);
}
