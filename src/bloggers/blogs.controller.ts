import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Query,
} from "@nestjs/common";
import { GetPostsByBlogQuery } from "./useCase/getPostsByBlogHandler";
import { BlogsPaginationDto } from "./dto/blogsPaginationDto";
import { FindBlogPublicQuery } from "./useCase/findBlogPublicHandler";
import { QueryBus } from "@nestjs/cqrs";
import { GetAllBlogsQuery } from "./useCase/getAllBlogsPublic";

@Controller("blogs")
export class BlogsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getBlogs(
    /*@Param('id', ParseUUIDPipe) id: string,*/
    @Query() dto: BlogsPaginationDto,
  ) {
    return this.queryBus.execute(new GetAllBlogsQuery(dto));
  }

  @Get(":blogId/posts")
  async getPostsByBlogger(
    @Param("blogId", ParseUUIDPipe) bloggerId: string,
    @Query() dto: BlogsPaginationDto,
  ) {
    return this.queryBus.execute(new GetPostsByBlogQuery(bloggerId, dto));
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  async findBlog(@Param("id", ParseUUIDPipe) id: string) {
    return this.queryBus.execute(new FindBlogPublicQuery(id));
  }
}
