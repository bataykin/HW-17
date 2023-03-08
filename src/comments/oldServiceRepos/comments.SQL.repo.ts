import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { FilterQuery, UpdateQuery } from "mongoose";
import { LikeStatusEnum } from "../../likes/LikeStatusEnum";

@Injectable()
export class CommentsSQLRepo {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  //// ORIGINAL FUNCTIONS ////

  async findById(id: string) {
    // return this.commentModel.findById(id)
    const result = await this.dataSource.query(
      `
                SELECT id, content, "userId", "userLogin", "likesInfo", "addedAt"
                FROM comments 
                WHERE id = $1
                    `,
      [id],
    );
    return result;
  }

  async createComment(comment: {
    userLogin: string;
    addedAt: Date;
    userId: string;
    content: string;
    likesInfo: { likesCount: number; dislikesCount: number; myStatus: string };
    postId: string;
  }) {
    // return this.commentModel.insertMany(comment)

    const result = await this.dataSource.query(
      `
                INSERT INTO comments 
                (content, "userId", "userLogin", "postId")
                VALUES ($1, $2, $3, $4)
                RETURNING id, content, "userId", "userLogin", "likesInfo", "addedAt"
                    `,
      [comment.content, comment.userId, comment.userLogin, comment.postId],
    );

    return result;
  }

  async getCommentsByPost(postId: string, skipSize: number, PageSize: number) {
    // return await this.commentModel.find({postId: postId}).skip(skipSize).limit(PageSize).exec();

    const result = await this.dataSource.query(
      `
                SELECT id, content, "userId", "userLogin", "likesInfo", "addedAt" 
                FROM comments
                WHERE "postId" = $1
                ORDER BY id
                LIMIT $2 OFFSET $3
                    `,
      [postId, PageSize, skipSize],
    );
    return result;
  }

  async countDocuments(filter: FilterQuery<any>) {
    // return this.commentModel.countDocuments(filter);

    const result = await this.dataSource.query(
      `
                SELECT 
                CASE
                    WHEN COUNT(*) > 0 THEN COUNT(*)
                    ELSE 0
                END AS total
                FROM comments
                    `,
      [],
    );
    return result;
  }

  async updateComment(commentId: string, content: string) {
    // return this.commentModel.findByIdAndUpdate(commentId, {content: content}, {new: true});
    const result = await this.dataSource.query(
      `
            UPDATE comments
            SET content = $1
            WHERE id = $2
            RETURNING *
            `,
      [content, commentId],
    );
    return result;
  }

  async deleteComment(commentId: string) {
    // return this.commentModel.findByIdAndDelete(commentId)
    const result = await this.dataSource.query(
      `
                DELETE FROM comments
                WHERE id = $1
                    `,
      [commentId],
    );
    return result;
  }

  async setLikeStatus(commentId: string, updateQuery: UpdateQuery<any>) {
    // return this.commentModel.findByIdAndUpdate(commentId, updateQuery, {new: true})
  }

  async getMyLikeInfo(userId: string, commentId: string) {
    // return this.commentModel.findOne({$and: [{userId: userId}, {_id: commentId}] }).select({_id: 0, likesInfo: 1})
  }

  async updateCommentWithLike(
    commentId: string,
    totalLikes: number,
    totalDislikes: number,
    likeStatus: LikeStatusEnum,
  ) {
    //     return this.commentModel.findByIdAndUpdate(commentId,
    //         {
    //             'likesInfo.likesCount': totalLikes,
    //             'likesInfo.dislikesCount': totalDislikes,
    //             'likesInfo.myStatus': 'None',
    //         },
    //         {new: true})
  }
}
