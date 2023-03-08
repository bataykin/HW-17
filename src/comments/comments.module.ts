import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { CommentsController } from "./comments.controller";
import { AuthModule } from "../auth/auth.module";
import { UsersModule } from "../users/users.module";
import { CommentsCheckUriBeforeBodyMiddleware } from "../middlewares/comments-check-uri-before-body-middleware.service";
import { CommentsSQLService } from "./oldServiceRepos/comments.SQL.service";
import { LikesModule } from "../likes/likes.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "../users/entity/user.entity";
import { CommentEntity } from "./entities/comment.entity";
import { CommentsORMService } from "./oldServiceRepos/comments.ORM.service";
import { useRepositoryClassGeneric } from "../common/useRepositoryClassGeneric";
import { ICommentsRepoToken } from "./ICommentsRepo";
import { CommentsORM } from "./comments.ORM";
import { CqrsModule } from "@nestjs/cqrs";
import { GetCommentByIdHandler } from "./useCase/getCommentByIdHandler";
import { UpdateCommentHandler } from "./useCase/updateCommentCommand";
import { RemoveCommentHandler } from "./useCase/removeCommentHandler";
import { SetLikeStatusHandler } from "./useCase/setLikeStatusHandler";
import { ILikesRepoToken } from "../likes/ILikesRepo";
import { LikesORM } from "../likes/likesORM";
import { LikeEntity } from "../likes/entities/like.entity";
import { IUsersRepoToken } from "../users/IUsersRepo";
import { UsersORM } from "../users/users.ORM";

export const useCommentServiceClass = () => {
  if (process.env.REPO_TYPE === "MONGO") {
    return CommentsSQLService;
  } else if (process.env.REPO_TYPE === "SQL") {
    return CommentsSQLService;
  } else if (process.env.REPO_TYPE === "ORM") {
    return CommentsORMService;
  } else return CommentsSQLService; // by DEFAULT if not in enum
};

const commentsRouteHandlers = [
  GetCommentByIdHandler,
  UpdateCommentHandler,
  RemoveCommentHandler,
  SetLikeStatusHandler,
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([CommentEntity, LikeEntity, UserEntity]),
    AuthModule,
    UsersModule,
    LikesModule,
  ],
  controllers: [CommentsController],
  providers: [
    ...commentsRouteHandlers,

    {
      provide: ICommentsRepoToken,
      useClass: useRepositoryClassGeneric(
        CommentsORM,
        CommentsORM,
        CommentsORM,
      ),
    },
    {
      provide: ILikesRepoToken,
      useClass: useRepositoryClassGeneric(LikesORM, LikesORM, LikesORM),
    },
    {
      provide: IUsersRepoToken,
      useClass: useRepositoryClassGeneric(UsersORM, UsersORM, UsersORM),
    },
    // CommentsORMService,
    // CommentsORMRepo,
    //
    // CommentsSQLService,
    // CommentsSQLRepo,
    //
    //
    // CommentsMongoService,
    // CommentsMongoRepo,
    CommentsCheckUriBeforeBodyMiddleware,
  ],
  exports: [
    {
      provide: ICommentsRepoToken,
      useClass: useRepositoryClassGeneric(
        CommentsORM,
        CommentsORM,
        CommentsORM,
      ),
    },
    // CommentsMongoService,
    // CommentsMongoRepo,
    //
    // CommentsSQLService,
    // CommentsSQLRepo,
    //
    // CommentsORMService,
    // CommentsORMRepo
  ],
})
export class CommentsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CommentsCheckUriBeforeBodyMiddleware).forRoutes("comments");
  }
}
