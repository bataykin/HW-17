import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { LikeStatusEnum } from "../LikeStatusEnum";
import { ILikesRepo } from "./ILikesRepo";
import { LikeEntity } from "../entities/like.entity";

@Injectable()
export class LikesSQLRepo implements ILikesRepo<LikeEntity> {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async setLikeStatusToPost(
    userId: string,
    postId: string,
    likeStatus: LikeStatusEnum,
  ) {
    return this.dataSource.query(
      `
            INSERT INTO likes ("userId", "postId", reaction)
                VALUES ($1, $2, $3)
                ON CONFLICT ON CONSTRAINT PK_LIKES_USER_POST
                DO UPDATE 
                SET reaction = $3
                RETURNING *
                    `,
      [userId, postId, likeStatus],
    );
  }

  async setLikeStatusToComment(
    userId: string,
    commentId: string,
    likeStatus: LikeStatusEnum,
  ) {
    return this.dataSource.query(
      `
            INSERT INTO likes ("userId", "commentId", reaction)
                VALUES ($1, $2, $3)
                ON CONFLICT ON CONSTRAINT PK_LIKES_USER_COMMENT
                DO UPDATE 
                SET reaction = $3
                RETURNING *
                    `,
      [userId, commentId, likeStatus],
    );
  }
}
