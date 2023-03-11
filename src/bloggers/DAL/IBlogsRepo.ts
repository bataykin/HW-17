import { CreateBlogDto } from "../dto/createBlogDto";
import { UpdateBlogDto } from "../dto/update-blog.dto";
import { BlogsPaginationDto } from "../dto/blogsPaginationDto";
import { BlogEntity } from "../entities/blogEntity";
import { BlogViewModel } from "../dto/BlogViewModel";

export const IBlogsRepoToken = Symbol("IBlogsRepoToken");

export interface IBlogsRepo<GenericBlogType> {
  createBlog(dto: CreateBlogDto, userId: string): Promise<GenericBlogType>;

  updateBlog(id: string, dto: UpdateBlogDto): Promise<GenericBlogType>;

  deleteBlog(id: string): Promise<any>;

  findBlogById(id: string): Promise<GenericBlogType | null>;

  SA_findBlogById(id: string): Promise<GenericBlogType | null>;

  countBlogs(): Promise<number>;

  getBlogsPaginatedPublic(
    dto: BlogsPaginationDto,
  ): Promise<GenericBlogType[] | null>;

  getBlogsOfBloggerPaginated(
    dto: BlogsPaginationDto,
    userIdFromToken: string,
  ): Promise<BlogEntity[]>;

  isBlogExistsByName(dto: CreateBlogDto): Promise<GenericBlogType | null>;

  getBlogNameById(id: string): Promise<string | null>;

  countBlogsBySearchnamePublic(searchNameTerm: string): Promise<number | null>;

  countBloggersBlogsBySearchname(searchNameTerm: string, userId: string);

  SA_bindBlogToUser(blogId: string, userId: string);

  mapBlogsToResponse(blogs: BlogEntity[]): Promise<BlogViewModel[]>;

  mapBlogToResponse(blogs: BlogEntity): Promise<BlogViewModel>;

  mapBlogsWithOwnersToResponse(blogs: BlogEntity[]);

  setBanStatus(blogId: string, isBanned: boolean): void;

  SA_getBlogsPaginated(
    dto: BlogsPaginationDto,
  ): Promise<GenericBlogType[] | null>;

  SA_countBlogsBySearchname(searchNameTerm: string);
}
