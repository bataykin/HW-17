import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Query,
  Request,
} from "@nestjs/common";
import { GetPostsByBlogQueryPublic } from "./useCase/getPostsByBlogHandler";
import { BlogsPaginationDto } from "./dto/blogsPaginationDto";
import { FindBlogPublicQuery } from "./useCase/findBlogPublicHandler";
import { QueryBus } from "@nestjs/cqrs";
import { GetAllBlogsQuery } from "./useCase/getAllBlogsPublic";
import { PaginationBasicDto } from "../comments/dto/paginationBasicDto";

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
    @Param("blogId", ParseUUIDPipe) blogId: string,
    @Query() dto: PaginationBasicDto,
    @Request() req,
  ) {
    const accessToken = req.headers.authorization?.split(" ")[1];
    return this.queryBus.execute(
      new GetPostsByBlogQueryPublic(blogId, dto, accessToken),
    );
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  async findBlog(@Param("id", ParseUUIDPipe) id: string) {
    return this.queryBus.execute(new FindBlogPublicQuery(id));
  }
}
