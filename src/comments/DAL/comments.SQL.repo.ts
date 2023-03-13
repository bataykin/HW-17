import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { LikeStatusEnum } from "../../likes/LikeStatusEnum";
import { ICommentsRepo } from "./ICommentsRepo";
import { CommentEntity } from "../entities/comment.entity";
import { CommentToRepoDTO } from "../dto/CommentToRepoDTO";
import { PaginationCommentsDto } from "../dto/paginationCommentsDto";
import { BlogsPaginationDto } from "src/bloggers/dto/blogsPaginationDto";
import { CommentViewPublicDTO } from "../dto/CommentViewPublicDTO";

@Injectable()
export class CommentsSQLRepo implements ICommentsRepo<CommentEntity> {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async mapCommentToResponsePublic(
    comment: CommentEntity,
  ): Promise<CommentViewPublicDTO> {
    const likes = await this.dataSource.query(
      `
        select * from likes
        left join posts on posts.id = likes."postId"
        left join blogs on blogs.id = posts."blogId"
        where "commentId" = $1 
        AND blogs."isBanned" = false
   `,
      [comment.id],
    );
    // console.log(likes);
    const result: CommentViewPublicDTO = {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatusEnum.None,
      },
    };
    return result;
  }

  async mapCommentsToResponse(
    allComments: CommentEntity[],
  ): Promise<CommentViewPublicDTO[]> {
    const mappedComments = [];
    for await (const comment of allComments) {
      mappedComments.push({
        id: comment.id,
        content: comment.content,
        commentatorInfo: {
          userId: comment.userId,
          userLogin: comment.userLogin,
        },
        createdAt: comment.createdAt,
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: LikeStatusEnum.None,
        },
      });
    }
    return mappedComments;
  }

  async getAllCommentByBlog(
    userId: string,
    dto: BlogsPaginationDto,
  ): Promise<CommentEntity[]> {
    throw new Error("Method not implemented.");
  }
  async mapCommentsToResponsePublic(
    allComments: CommentEntity[],
  ): Promise<CommentViewPublicDTO[]> {
    const mappedComments = [];
    for await (const comment of allComments) {
      mappedComments.push({
        id: comment.id,
        content: comment.content,
        commentatorInfo: {
          userId: comment.userId,
          userLogin: comment.userLogin,
        },
        createdAt: comment.createdAt,
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: LikeStatusEnum.None,
        },
      });
    }
    return mappedComments;
  }
  async countAllCommentsForAllUserBlogs(userId: string): Promise<number> {
    throw new Error("Method not implemented.");
  }

  //// ORIGINAL FUNCTIONS ////

  async findCommentById(id: string) {
    // return this.commentModel.findById(id)
    const result = await this.dataSource.query(
      `
                SELECT *
                FROM comments 
                WHERE id = $1
                    `,
      [id],
    );
    return result[0] ?? null;
  }

  async createComment(comment: CommentToRepoDTO) {
    // return this.commentModel.insertMany(comment)

    const result = await this.dataSource.query(
      `
                INSERT INTO comments 
                (content, "userId", "userLogin", "postId")
                VALUES ($1, $2, $3, $4)
                RETURNING *
                    `,
      [comment.content, comment.userId, comment.userLogin, comment.postId],
    );

    return result[0] ?? result;
  }

  async getCommentsByPost(
    postId: string,
    dto: PaginationCommentsDto,
  ): Promise<CommentEntity[]> {
    // return await this.commentModel.find({postId: postId}).skip(skipSize).limit(PageSize).exec();

    const result = await this.dataSource.query(
      `
                SELECT *
                FROM comments
                WHERE "postId" = $1
                ORDER BY id
                LIMIT $2 OFFSET $3
                    `,
      [postId, dto.pageSize, dto.skipSize],
    );
    return result ?? null;
  }

  async countCommentsOnPost(postId: string, dto: PaginationCommentsDto) {
    const result = await this.dataSource.query(
      `
                SELECT 
                CASE
                    WHEN COUNT(*) > 0 THEN COUNT(*)
                    ELSE 0
                END AS total
                FROM comments
                where "postId" = $1
                    `,
      [postId],
    );
    return result[0].total ?? 0;
  }

  async updateComment(commentId: string, content: string) {
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
}
