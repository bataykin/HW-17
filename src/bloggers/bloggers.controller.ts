import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { CreateBlogDto } from "./dto/createBlogDto";
import { BlogsPaginationDto } from "./dto/blogsPaginationDto";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { GetBlogsOfBloggerQuery } from "./useCase/getBlogsOfBloggerHandler";
import { CreateBlogCommand } from "./useCase/createBlogHandler";
import { RemoveBlogCommand } from "./useCase/removeBlogHandler";
import { UpdateBlogCommand } from "./useCase/updateBlogHandler";
import { CreatePostByBlogCommand } from "./useCase/createPostByBlogHandler";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UpdatePostByBlogDto } from "./dto/UpdatePostByBlogDto";
import { SkipThrottle } from "@nestjs/throttler";
import { UpdatePostByBlogCommand } from "./useCase/UpdatePostByBlogHandler";
import { BloggerDeletePostByBlogCommand } from "./useCase/DeletePostByBlogHandler";
import { ChangeBlogByOtherUserInterceptor } from "./interceptors/blogMutationInterceptor";
import { ChangePostByOtherUserInterceptor } from "./interceptors/postMutationInterceptor";
import { GetAllCommentsOnMyBlogCommand } from "./useCase/getAllCommentsOnMyBlogHandler";
import { BanUserByBlogDto } from "./dto/banUserByBlogDto";
import { BanUnbanUserByBloggerCommand } from "./useCase/BanUnbanUserByBlogHandler";
import { GetBannedUsersForBlogQuery } from "./useCase/getBannedUsersForBlogHandler";
import { GetBannedUsersPaginationDTO } from "./dto/GetBannedUsersPaginationDTO";
import { CreatePostDto } from "../posts/dto/create-post.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { Express } from "express";
import { UploadWallpaperBlogCommand } from "./useCase/UploadWallpaperBlogHandler";
import { UploadMainBlogCommand } from "./useCase/UploadMainBlogHandler";
import { UploadMainPostCommand } from "./useCase/UploadMainPostHandler";

@SkipThrottle()
@Controller("blogger")
export class BloggersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post("blogs/:blogId/images/wallpaper")
  @UseInterceptors(FileInterceptor("file", {}))
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  async uploadWallpaperForBlog(
    @Request() req,
    @Param("blogId", ParseUUIDPipe) blogId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: ".(png|jpeg|jpg)" }),
          new MaxFileSizeValidator({ maxSize: 1024 * 100 }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const accessToken = req.headers.authorization?.split(" ")[1];
    return await this.commandBus.execute(
      new UploadWallpaperBlogCommand(file, blogId, accessToken),
    );
  }

  @Post("blogs/:blogId/images/main")
  @UseInterceptors(FileInterceptor("file", {}))
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  async uploadMainForBlog(
    @Request() req,
    @Param("blogId", ParseUUIDPipe) blogId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: ".(png|jpeg|jpg)" }),
          new MaxFileSizeValidator({ maxSize: 1024 * 100 }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const accessToken = req.headers.authorization?.split(" ")[1];
    return await this.commandBus.execute(
      new UploadMainBlogCommand(file, blogId, accessToken),
    );
  }

  @Post("blogs/:blogId/posts/:postId/images/main")
  @UseInterceptors(FileInterceptor("file", {}))
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  async uploadMainForPost(
    @Request() req,
    @Param("blogId", ParseUUIDPipe) blogId: string,
    @Param("postId", ParseUUIDPipe) postId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: ".(png|jpeg|jpg)" }),
          new MaxFileSizeValidator({ maxSize: 1024 * 100 }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const accessToken = req.headers.authorization?.split(" ")[1];
    return await this.commandBus.execute(
      new UploadMainPostCommand(file, blogId, postId, accessToken),
    );
  }

  @Get("blogs/comments")
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async getAllCommentsOnMyBlog(
    @Query() dto: BlogsPaginationDto,
    @Request() req,
  ) {
    const accessToken = req.headers.authorization?.split(" ")[1];
    return this.queryBus.execute(
      new GetAllCommentsOnMyBlogCommand(dto, accessToken),
    );
  }

  @Delete("blogs/:id")
  @UseInterceptors(ChangeBlogByOtherUserInterceptor)
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async removeBlog(@Param("id", ParseUUIDPipe) id: string, @Request() req) {
    const accessToken = req.headers.authorization?.split(" ")[1];
    return this.commandBus.execute(new RemoveBlogCommand(id, accessToken));
  }

  @Put("blogs/:id")
  @UseInterceptors(ChangeBlogByOtherUserInterceptor)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param("id", ParseUUIDPipe) blogId: string,
    @Body() dto: CreateBlogDto,
    @Request() req,
  ) {
    const accessToken = req.headers.authorization?.split(" ")[1];
    return this.commandBus.execute(
      new UpdateBlogCommand(blogId, dto, accessToken),
    );
  }

  @Post("blogs/:blogId/posts")
  @UseGuards(JwtAuthGuard)
  async createPostByBlog(
    @Param("blogId", ParseUUIDPipe) blogId: string,
    @Body() dto: CreatePostDto,
    @Request() req,
  ) {
    const accessToken = req.headers.authorization?.split(" ")[1];
    return this.commandBus.execute(
      new CreatePostByBlogCommand(blogId, dto, accessToken),
    );
  }

  @Put("blogs/:blogId/posts/:postId")
  @UseInterceptors(ChangePostByOtherUserInterceptor)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePostByBlog(
    @Param("blogId", ParseUUIDPipe) blogId: string,
    @Param("postId", ParseUUIDPipe) postId: string,
    @Body() dto: UpdatePostByBlogDto,
    @Request() req,
  ) {
    const accessToken = req.headers.authorization?.split(" ")[1];
    return this.commandBus.execute(
      new UpdatePostByBlogCommand(blogId, postId, dto, accessToken),
    );
  }

  @Delete("blogs/:blogId/posts/:postId")
  @UseInterceptors(ChangePostByOtherUserInterceptor)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePostByBlog(
    @Param("blogId", ParseUUIDPipe) blogId: string,
    @Param("postId", ParseUUIDPipe) postId: string,
    @Request() req,
  ) {
    const accessToken = req.headers.authorization?.split(" ")[1];
    return this.commandBus.execute(
      new BloggerDeletePostByBlogCommand(blogId, postId, accessToken),
    );
  }

  @Post("blogs")
  @UseGuards(JwtAuthGuard)
  async createBlog(
    @Body()
    dto: CreateBlogDto,
    @Request() req,
  ) {
    const accessToken = req.headers.authorization?.split(" ")[1];
    return this.commandBus.execute(new CreateBlogCommand(dto, accessToken));
  }

  @Get("blogs")
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async getMyBlogs(@Query() dto: BlogsPaginationDto, @Request() req) {
    const accessToken = req.headers.authorization?.split(" ")[1];
    return this.queryBus.execute(new GetBlogsOfBloggerQuery(dto, accessToken));
  }

  @Put("users/:id/ban")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async banUnbanUserByBlog(
    @Param("id", ParseUUIDPipe) userId: string,
    @Body() dto: BanUserByBlogDto,
    @Request() req,
  ) {
    const accessToken = req.headers.authorization?.split(" ")[1];
    return this.commandBus.execute(
      new BanUnbanUserByBloggerCommand(userId, dto, accessToken),
    );
  }

  @Get("users/blog/:id")
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async getBannedUsersForBlogId(
    @Param("id", ParseUUIDPipe) blogId: string,
    @Query() dto: GetBannedUsersPaginationDTO,
    @Request() req,
  ) {
    const accessToken = req.headers.authorization?.split(" ")[1];
    return this.queryBus.execute(
      new GetBannedUsersForBlogQuery(blogId, dto, accessToken),
    );
  }
}
