import { CreateBloggerDto } from "../dto/create.blogger.dto";
import { UpdateBlogDto } from "../dto/update-blog.dto";
import { BlogsPaginationDto } from "../dto/blogsPaginationDto";
import { BlogEntity } from "../entities/blogEntity";

export const IBlogsRepoToken = Symbol("IBlogsRepoToken");

export interface IBlogsRepo<GenericBlogType> {
  createBlog(dto: CreateBloggerDto, userId: string): Promise<GenericBlogType>;

  updateBlog(id: string, dto: UpdateBlogDto): Promise<GenericBlogType>;

  deleteBlog(id: string): Promise<any>;

  findBlogById(id: string): Promise<GenericBlogType | null>;

  SA_findBlogById(id: string): Promise<GenericBlogType | null>;

  countBlogs(): Promise<number>;

  getBlogsPaginated(
    dto: BlogsPaginationDto,
    userIdFromToken?: string,
  ): Promise<GenericBlogType[] | null>;

  getBlogsOfBloggerPaginated(
    dto: BlogsPaginationDto,
    userIdFromToken: string,
  ): Promise<BlogEntity[]>;

  isBlogExistsByName(dto: CreateBloggerDto): Promise<GenericBlogType | null>;

  getBlogNameById(id: string): Promise<string | null>;

  countBlogsBySearchname(searchNameTerm: string);

  countBloggersBlogsBySearchname(searchNameTerm: string, userId: string);

  SA_bindBlogToUser(blogId: string, userId: string);

  mapBlogsToResponse(blogs: BlogEntity[], ...rows: string[]);

  mapBlogToResponse(blogs: BlogEntity, ...rows: string[]);

  mapBlogsWithOwnersToResponse(blogs: BlogEntity[]);

  setBanStatus(blogId: string, isBanned: boolean): void;

  SA_getBlogsPaginated(
    dto: BlogsPaginationDto,
  ): Promise<GenericBlogType[] | null>;

  SA_countBlogsBySearchname(searchNameTerm: string);
}
