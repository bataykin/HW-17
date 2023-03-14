import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { CommentsController } from "./comments.controller";
import { AuthModule } from "../auth/auth.module";
import { UsersModule } from "../users/users.module";
import { CommentsCheckUriBeforeBodyMiddleware } from "../middlewares/comments-check-uri-before-body-middleware.service";
import { LikesModule } from "../likes/likes.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "../users/entity/user.entity";
import { CommentEntity } from "./entities/comment.entity";
import { ICommentsRepoToken } from "./DAL/ICommentsRepo";
import { CqrsModule } from "@nestjs/cqrs";
import { GetCommentByIdHandlerPublic } from "./useCase/getCommentByIdHandlerPublic";
import { UpdateCommentHandler } from "./useCase/updateCommentCommand";
import { RemoveCommentHandler } from "./useCase/removeCommentHandler";
import { SetLikeStatusHandler } from "./useCase/setLikeStatusHandler";
import { ILikesRepoToken } from "../likes/DAL/ILikesRepo";
import { LikeEntity } from "../likes/entities/like.entity";
import { IUsersRepoToken } from "../users/DAL/IUsersRepo";
import { UsersSQLRepo } from "../users/DAL/users.SQL.repo";
import { LikesSQLRepo } from "../likes/DAL/likes.SQL.repo";
import { CommentsSQLRepo } from "./DAL/comments.SQL.repo";
import { IUsersQueryRepoToken } from "../users/DAL/IUserQueryRepo";
import { UsersSQLQueryRepo } from "../users/DAL/users.SQL.QueryRepo";

const commentsRouteHandlers = [
  GetCommentByIdHandlerPublic,
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
      useClass: CommentsSQLRepo,
    },
    {
      provide: ILikesRepoToken,
      useClass: LikesSQLRepo,
    },
    {
      provide: IUsersRepoToken,
      useClass: UsersSQLRepo,
    },
    {
      provide: IUsersQueryRepoToken,
      useClass: UsersSQLQueryRepo,
    },

    CommentsCheckUriBeforeBodyMiddleware,
  ],
  exports: [
    {
      provide: ICommentsRepoToken,
      useClass: CommentsSQLRepo,
    },
  ],
})
export class CommentsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CommentsCheckUriBeforeBodyMiddleware).forRoutes("comments");
  }
}
