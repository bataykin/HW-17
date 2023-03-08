import {
  forwardRef,
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { PostsMongoService } from './oldServicesRepos/posts.Mongo.service';
import { PostsController } from './posts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './post.schema';
import { BloggersModule } from '../bloggers/bloggers.module';
import { CommentsModule } from '../comments/comments.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../auth/constants';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { PostsCheckUriBeforeBodyMiddleware } from '../middlewares/posts-check-uri-before-body-middleware.service';
import { PostsSQLService } from './oldServicesRepos/posts.SQL.service';
import { PostsORMService } from './oldServicesRepos/posts.ORM.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogEntity } from '../bloggers/entities/blogEntity';
import { PostEntity } from './entities/post.entity';
import { PostService } from './post.service';
import { IPostsRepoToken } from './IPostsRepo';
import { PostsORM } from './posts.ORM';
import { useRepositoryClassGeneric } from '../common/useRepositoryClassGeneric';
import { IBlogsRepoToken } from '../bloggers/IBlogsRepo';
import { BlogsORM } from '../bloggers/blogs.ORM';
import { CqrsModule } from '@nestjs/cqrs';
import { GetAllPostsHandler } from './useCase/getAllPostsHandler';
import { CreatePostHandler } from './useCase/createPostHandler';
import { FindPostByIdHandler } from './useCase/findPostByIdHandler';
import { UpdatePostHandler } from './useCase/updatePostHandler';
import { RemovePostHandler } from './useCase/removePostHandler';
import { GetCommentsByPostHandler } from './useCase/getCommentsByPostHandler';
import { CreateCommentByPostHandler } from './useCase/createCommentByPostHandler';
import { ICommentsRepoToken } from '../comments/ICommentsRepo';
import { CommentsORM } from '../comments/comments.ORM';
import { CommentEntity } from '../comments/entities/comment.entity';
import { AuthService } from '../auth/authService';
import { IUsersRepoToken } from '../users/IUsersRepo';
import { UsersORM } from '../users/users.ORM';
import { UserEntity } from '../users/entity/user.entity';
import { ILikesRepoToken } from '../likes/ILikesRepo';
import { LikesORM } from '../likes/likesORM';
import { LikeEntity } from '../likes/entities/like.entity';
import { SetLikeToPostHandler } from './useCase/setLikeToPostHandler';
import { IsBlogExistConstraint } from '../bloggers/decorators/isBloggerExistsDecorator';
import { IBannedUsersRepoToken } from '../bloggers/IBannedUsersRepo';
import { BannedUsersORM } from '../bloggers/bannedUsers.ORM';
import { BannedUsersEntity } from '../bloggers/entities/bannedUsersEntity';
//import {BlogPostModule} from "../BlogPostModule/blogPost.module";

export const usePostServiceClass = () => {
  if (process.env.REPO_TYPE === 'MONGO') {
    return PostsMongoService;
  } else if (process.env.REPO_TYPE === 'SQL') {
    return PostsSQLService;
  } else if (process.env.REPO_TYPE === 'ORM') {
    return PostsORMService;
  } else return PostsMongoService; // by DEFAULT if not in enum
};

const PostRouteHandlers = [
  GetAllPostsHandler,
  CreatePostHandler,
  FindPostByIdHandler,
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
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
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

    PostService,
    {
      provide: IPostsRepoToken,
      useClass: useRepositoryClassGeneric(PostsORM, PostsORM, PostsORM),
    },
    {
      provide: ICommentsRepoToken,
      useClass: useRepositoryClassGeneric(
        CommentsORM,
        CommentsORM,
        CommentsORM,
      ),
    },
    {
      provide: IUsersRepoToken,
      useClass: useRepositoryClassGeneric(UsersORM, UsersORM, UsersORM),
    },
    {
      provide: ILikesRepoToken,
      useClass: useRepositoryClassGeneric(LikesORM, LikesORM, LikesORM),
    },
    {
      provide: IBlogsRepoToken,
      useClass: useRepositoryClassGeneric(BlogsORM, BlogsORM, BlogsORM),
    },
    {
      provide: IBannedUsersRepoToken,
      useClass: useRepositoryClassGeneric(
        BannedUsersORM,
        BannedUsersORM,
        BannedUsersORM,
      ),
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
    PostService,

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
    consumer.apply(PostsCheckUriBeforeBodyMiddleware).forRoutes('posts');
  }
}
