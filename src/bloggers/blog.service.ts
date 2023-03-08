import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { BlogEntity } from "./entities/blogEntity";
import { BlogsPaginationDto } from "./dto/blogsPaginationDto";
import { IBlogsRepo, IBlogsRepoToken } from "./IBlogsRepo";
import { CreateBloggerDto } from "./dto/create.blogger.dto";
import { UpdateBlogDto } from "./dto/update-blog.dto";

@Injectable()
export class BlogService {
  constructor(
    @Inject(IBlogsRepoToken)
    private readonly blogsRepo: IBlogsRepo<BlogEntity>,
  ) {}

  async getAllBlogs(dto: BlogsPaginationDto) {
    //TODO Check if we send string in pageSize query parameter - we get null as value, how avoid this?
    const {
      searchNameTerm = null,
      pageNumber = 1,
      pageSize = 10,
      sortBy = 'createdAt',
      sortDirection = 'desc',
      skipSize = +pageNumber > 1 ? +pageSize * (+pageNumber - 1) : 0,
    } = dto;
    const blogsPaginationBLLdto = {
      searchNameTerm,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      skipSize,
    };
    const blogs = await this.blogsRepo.getBlogsPaginated(blogsPaginationBLLdto);
    const docCount = await this.blogsRepo.countBlogs();
    const result = {
      pagesCount: Math.ceil(docCount / +pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: docCount,
      items: blogs,
    };
    return result;
  }

  async createBlog(dto: CreateBloggerDto) {
    const isExists = await this.blogsRepo.isBlogExistsByName(dto);
    if (isExists) {
      throw new BadRequestException('Takoi blog name exists');
    }
    // return await this.blogsRepo.createBlog(dto, userIdFromToken)
  }

  async findBlogById(id: string) {
    try {
      const blog = await this.blogsRepo.findBlogById(id);
      if (!blog) {
        throw new NotFoundException('net takogo blog id');
      }
      return blog;
    } finally {
    }
  }

  async updateBlog(id: string, dto: UpdateBlogDto) {
    await this.findBlogById(id);
    return await this.blogsRepo.updateBlog(id, dto);
  }

  async deleteBlog(id: string) {
    await this.findBlogById(id);
    return await this.blogsRepo.deleteBlog(id);
  }

  async getBlogNameById(id: string): Promise<string> {
    return await this.blogsRepo.getBlogNameById(id);
  }
}
