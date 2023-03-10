import {
  forwardRef,
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
} from "@nestjs/common";
import { PostsController } from "./posts.controller";
import { BloggersModule } from "../bloggers/bloggers.module";
import { CommentsModule } from "../comments/comments.module";
import { JwtModule } from "@nestjs/jwt";
import { jwtConstants } from "../auth/constants";
import { AuthModule } from "../auth/auth.module";
import { UsersModule } from "../users/users.module";
import { PostsCheckUriBeforeBodyMiddleware } from "../middlewares/posts-check-uri-before-body-middleware.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BlogEntity } from "../bloggers/entities/blogEntity";
import { PostEntity } from "./entities/post.entity";
import { IPostsRepoToken } from "./DAL/IPostsRepo";
import { IBlogsRepoToken } from "../bloggers/DAL/IBlogsRepo";
import { CqrsModule } from "@nestjs/cqrs";
import { GetAllPostsHandler } from "./useCase/getAllPostsHandler";
import { CreatePostHandler } from "./useCase/createPostHandler";
import { PublicFindPostByIdHandler } from "./useCase/PublicFindPostByIdHandler";
import { UpdatePostHandler } from "./useCase/updatePostHandler";
import { RemovePostHandler } from "./useCase/removePostHandler";
import { GetCommentsByPostHandler } from "./useCase/getCommentsByPostHandler";
import { CreateCommentByPostHandler } from "./useCase/createCommentByPostHandler";
import { ICommentsRepoToken } from "../comments/DAL/ICommentsRepo";
import { CommentEntity } from "../comments/entities/comment.entity";
import { AuthService } from "../auth/authService";
import { IUsersRepoToken } from "../users/DAL/IUsersRepo";
import { UserEntity } from "../users/entity/user.entity";
import { ILikesRepoToken } from "../likes/DAL/ILikesRepo";
import { LikeEntity } from "../likes/entities/like.entity";
import { SetLikeToPostHandler } from "./useCase/setLikeToPostHandler";
import { IsBlogExistConstraint } from "../bloggers/decorators/isBloggerExistsDecorator";
import { IBannedUsersRepoToken } from "../bloggers/DAL/IBannedUsersRepo";
import { BannedUsersEntity } from "../bloggers/entities/bannedUsersEntity";
import { IUsersQueryRepoToken } from "../users/DAL/IUserQueryRepo";
import { UsersSQLRepo } from "../users/DAL/users.SQL.repo";
import { UsersSQLQueryRepo } from "../users/DAL/users.SQL.QueryRepo";
import { BloggersSQLRepo } from "../bloggers/DAL/bloggers.SQL.repo";
import { BannedUsersSQLRepo } from "../bloggers/DAL/BannedUsersSQLRepo";
import { PostsSQLRepo } from "./DAL/posts.SQL.repo";
import { LikesSQLRepo } from "../likes/DAL/likes.SQL.repo";
import { CommentsSQLRepo } from "../comments/DAL/comments.SQL.repo";

const PostRouteHandlers = [
  GetAllPostsHandler,
  CreatePostHandler,
  PublicFindPostByIdHandler,
  UpdatePostHandler,
  RemovePostHandler,
  SetLikeToPostHandler,

  GetCommentsByPostHandler,
  CreateCommentByPostHandler,
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      PostEntity,
      CommentEntity,
      BlogEntity,
      UserEntity,
      LikeEntity,
      BannedUsersEntity,
    ]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: "60s" },
    }),
    // LikesModule,
    CommentsModule,
    AuthModule,
    UsersModule,
    forwardRef(() => BloggersModule),
    //BlogPostModule,
    // BloggersModule,
  ],

  controllers: [PostsController],

  providers: [
    Logger,

    IsBlogExistConstraint,

    ...PostRouteHandlers,

    {
      provide: IPostsRepoToken,
      useClass: PostsSQLRepo,
    },
    {
      provide: ICommentsRepoToken,
      useClass: CommentsSQLRepo,
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
      provide: ILikesRepoToken,
      useClass: LikesSQLRepo,
    },
    {
      provide: IBlogsRepoToken,
      useClass: BloggersSQLRepo,
    },
    {
      provide: IBannedUsersRepoToken,
      useClass: BannedUsersSQLRepo,
    },
    AuthService,
    // {
    //     provide: IBlogsRepoToken,
    //     useClass: useRepositoryClassGeneric(BlogsORM, BlogsORM, BlogsORM)
    // },

    // BlogService,
    // BlogPostService,

    //
    // PostsORMService,
    // PostORMRepo,
    //
    //
    // PostsSQLService,
    // PostsSQLRepo,
    //
    // PostsMongoService,
    // PostsMongoRepo,
    //
    // CommentsMongoService,
    // CommentsSQLService,

    PostsCheckUriBeforeBodyMiddleware,
  ],

  exports: [
    IPostsRepoToken,

    // PostsMongoService,
    // PostsSQLService,
    // PostsSQLRepo,
    //
    // PostsORMService,
    // PostORMRepo,
  ],
})
export class PostsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PostsCheckUriBeforeBodyMiddleware).forRoutes("posts");
  }
}
