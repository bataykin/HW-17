import { CreateBlogDto } from "../dto/createBlogDto";
import { UpdateBlogDto } from "../dto/update-blog.dto";
import { BlogsPaginationDto } from "../dto/blogsPaginationDto";
import { BlogEntity } from "../entities/blogEntity";
import { BlogViewModel } from "../dto/BlogViewModel";
import { SA_BlogViewModel } from "../../superadmin/dto/SA_BlogViewModel";

export const IBlogsRepoToken = Symbol("IBlogsRepoToken");

export interface IBlogsRepo<GenericBlogType> {
  createBlog(dto: CreateBlogDto, userId: string): Promise<GenericBlogType>;

  updateBlog(id: string, dto: UpdateBlogDto): Promise<GenericBlogType>;

  deleteBlog(id: string): Promise<any>;

  findBlogById(id: string): Promise<GenericBlogType | null>;

  findBlogByIdPublic(blogId: string): Promise<GenericBlogType | null>;

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

  SA_SetBlogBanStatus(blogId: string, isBanned: boolean): void;

  SA_GetBlogs(dto: BlogsPaginationDto): Promise<GenericBlogType[] | null>;

  SA_countBlogsBySearchname(searchNameTerm: string);

  SA_mapBlogToResponse(blogs: any): Promise<SA_BlogViewModel[]>;
  SA_mapBlogsToResponse(blogs: any): Promise<SA_BlogViewModel[]>;
}
