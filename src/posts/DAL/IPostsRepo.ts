import { CreatePostDto } from "../dto/create-post.dto";
import { UpdatePostDto } from "../dto/update-post.dto";
import { PaginationPostsDto } from "../dto/pagination.posts.dto";
import { PostDalDto } from "../dto/post.dal.dto";

export const IPostsRepoToken = Symbol("IPostsRepoToken");

export interface IPostsRepo<GenericPostType> {
  createPost(post: PostDalDto): Promise<GenericPostType>;

  updatePost(id: string, dto: UpdatePostDto): Promise<any>;

  deletePost(id: string): Promise<any>;

  findPostById(id: string): Promise<GenericPostType | null>;

  countPosts(): Promise<number>;

  countPostsByBlogId(blogId: string): Promise<number>;

  getPostsPaginated(dto: PaginationPostsDto): Promise<GenericPostType[]>;

  isPostExists(dto: CreatePostDto): Promise<GenericPostType | null>;

  getPostByBloggerId(
    bloggerId: string,
    userId: string,
    dto: PaginationPostsDto,
  ): Promise<GenericPostType | null>;

  // setLikeStatus(postId: number, dto:UpdatePostDto): Promise<any>

  getPostsPaginatedByBlog(dto: PaginationPostsDto, blogId: string);
}
