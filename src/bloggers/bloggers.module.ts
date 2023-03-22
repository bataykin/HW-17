import { forwardRef, Module } from "@nestjs/common";
import { BloggersController } from "./bloggers.controller";
import { PostsModule } from "../posts/posts.module";
import { AuthModule } from "../auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BlogEntity } from "./entities/blogEntity";
import { LikesModule } from "../likes/likes.module";
import { UsersModule } from "../users/users.module";
import { BlogService } from "./blog.service";
import { IBlogsRepoToken } from "./DAL/IBlogsRepo";
import { PostEntity } from "../posts/entities/post.entity";
import { CqrsModule } from "@nestjs/cqrs";
import { GetBlogsOfBloggerHandler } from "./useCase/getBlogsOfBloggerHandler";
import { CreateBlogHandler } from "./useCase/createBlogHandler";
import { RemoveBlogHandler } from "./useCase/removeBlogHandler";
import { UpdateBlogHandler } from "./useCase/updateBlogHandler";
import { FindBlogPublicHandler } from "./useCase/findBlogPublicHandler";
import { GetPostsByBlogHandler } from "./useCase/getPostsByBlogHandler";
import { IPostsRepoToken } from "../posts/DAL/IPostsRepo";
import { IUsersRepoToken } from "../users/DAL/IUsersRepo";
import { UserEntity } from "../users/entity/user.entity";
import { CreatePostByBlogHandler } from "./useCase/createPostByBlogHandler";
import { ILikesRepoToken } from "../likes/DAL/ILikesRepo";
import { LikeEntity } from "../likes/entities/like.entity";
import { DeletePostByBlogHandler } from "./useCase/DeletePostByBlogHandler";
import { UpdatePostByBlogHandler } from "./useCase/UpdatePostByBlogHandler";
import { BlogsController } from "./blogs.controller";
import { BannedUsersEntity } from "./entities/bannedUsersEntity";
import { GetAllCommentsOnMyBlogHandler } from "./useCase/getAllCommentsOnMyBlogHandler";
import { ICommentsRepoToken } from "../comments/DAL/ICommentsRepo";
import { CommentEntity } from "../comments/entities/comment.entity";
import { BanUnbanUserByBlogHandler } from "./useCase/BanUnbanUserByBlogHandler";
import { GetAllBlogsPublicHandler } from "./useCase/getAllBlogsPublic";
import { IBannedUsersRepoToken } from "./DAL/IBannedUsersRepo";
import { GetBannedUsersForBlogHandler } from "./useCase/getBannedUsersForBlogHandler";
import { IUsersQueryRepoToken } from "../users/DAL/IUserQueryRepo";
import { UsersSQLRepo } from "../users/DAL/users.SQL.repo";
import { UsersSQLQueryRepo } from "../users/DAL/users.SQL.QueryRepo";
import { BloggersSQLRepo } from "./DAL/bloggers.SQL.repo";
import { PostsSQLRepo } from "../posts/DAL/posts.SQL.repo";
import { BannedUsersSQLRepo } from "./DAL/BannedUsersSQLRepo";
import { LikesSQLRepo } from "../likes/DAL/likes.SQL.repo";
import { CommentsSQLRepo } from "../comments/DAL/comments.SQL.repo";
import { UploadWallpaperBlogHandler } from "./useCase/UploadWallpaperBlogHandler";
import { ImagesService } from "../images/images.service";
import { ImageEntity } from "../images/entities/ImageEntity";
import { UploadMainBlogHandler } from "./useCase/UploadMainBlogHandler";

const blogsRouteHandlers = [
  GetBlogsOfBloggerHandler,
  GetAllBlogsPublicHandler,
  CreateBlogHandler,
  RemoveBlogHandler,
  UpdateBlogHandler,
  FindBlogPublicHandler,
  GetPostsByBlogHandler,

  CreatePostByBlogHandler,
  UpdatePostByBlogHandler,
  DeletePostByBlogHandler,

  GetAllCommentsOnMyBlogHandler,
  BanUnbanUserByBlogHandler,
  GetBannedUsersForBlogHandler,

  UploadWallpaperBlogHandler,
  UploadMainBlogHandler,
];

// let a = useServiceClassGeneric<BloggersMongoService, BloggersSQLService, BloggersORMService>(BloggersMongoService, BloggersSQLService, BloggersORMService)

@Module({
  imports: [
    // MulterModule.register({})
    CqrsModule,
    TypeOrmModule.forFeature([
      BlogEntity,
      BannedUsersEntity,
      PostEntity,
      UserEntity,
      LikeEntity,
      CommentEntity,
      ImageEntity,
    ]),

    forwardRef(() => PostsModule),
    AuthModule,
    UsersModule,
    LikesModule,
  ],

  controllers: [BloggersController, BlogsController],

  providers: [
    ...blogsRouteHandlers,
    BlogService,
    {
      provide: IBlogsRepoToken,
      useClass: BloggersSQLRepo,
    },
    {
      provide: IPostsRepoToken,
      useClass: PostsSQLRepo,
    },
    {
      provide: IUsersRepoToken,
      useClass: UsersSQLRepo,
    },
    {
      provide: IUsersQueryRepoToken,
      useClass: UsersSQLQueryRepo,
    },

    {
      provide: IBannedUsersRepoToken,
      useClass: BannedUsersSQLRepo,
    },
    {
      provide: ILikesRepoToken,
      useClass: LikesSQLRepo,
    },
    {
      provide: ICommentsRepoToken,
      useClass: CommentsSQLRepo,
    },

    ImagesService,
  ],
  exports: [IBlogsRepoToken, BlogService],
})
export class BloggersModule {}
