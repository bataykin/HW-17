import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { LikeStatusEnum } from "../../likes/LikeStatusEnum";
import { ICommentsRepo } from "./ICommentsRepo";
import { CommentEntity } from "../entities/comment.entity";
import { CommentToRepoDTO } from "../dto/CommentToRepoDTO";
import { PaginationBasicDto } from "../dto/paginationBasicDto";
import { CommentViewPublicDTO } from "../dto/CommentViewPublicDTO";
import { UserEntity } from "../../users/entity/user.entity";
import { LikesEnum } from "../../posts/entities/likes.enum";
import { CommentViewForBloggerDTO } from "../../bloggers/dto/CommentViewForBloggerDTO";

@Injectable()
export class CommentsSQLRepo implements ICommentsRepo<CommentEntity> {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async mapCommentToResponsePublic(
    comment: CommentEntity,
    user: UserEntity | null,
  ): Promise<CommentViewPublicDTO> {
    const myStatus: LikeStatusEnum = user
      ? await this.dataSource
          .query(
            `
          select 
          reaction
          from likes
         
          where "commentId" = $1 and "userId" = $2
    `,
            [comment.id, user.id],
          )
          .then((res) => res[0]?.reaction ?? LikeStatusEnum.None)
      : LikesEnum.None;

    const likes = await this.dataSource.query(
      `
    select 
    sum( case when reaction = '${LikesEnum.Like}' then 1 else 0 end) as "likesCount",
    sum( case when reaction = '${LikesEnum.Dislike}' then 1 else 0 end) as "dislikesCount"
    from likes
    left join users on users.id = likes."userId"
    where likes."commentId" = $1 and users."isBanned" = false
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
        likesCount: +likes[0]?.likesCount ?? 0,
        dislikesCount: +likes[0]?.dislikesCount ?? 0,
        myStatus: myStatus,
      },
    };
    return result;
  }

  async mapCommentsToResponsePublic(
    allComments: CommentEntity[],
    user: UserEntity | null,
  ): Promise<CommentViewPublicDTO[]> {
    const mappedComments: CommentViewPublicDTO[] = [];
    for await (const comment of allComments) {
      mappedComments.push(await this.mapCommentToResponsePublic(comment, user));
    }
    return mappedComments;
  }

  async getAllCommentsByBlog(
    userId: string,
    dto: PaginationBasicDto,
  ): Promise<CommentEntity[]> {
    const result = await this.dataSource.query(
      `
                SELECT comments.*
                FROM comments 
                left join posts on posts.id = comments."postId"
                left join blogs on blogs.id = posts."blogId"
                left join users on users.id = comments."userId"
                WHERE blogs."userId" = $1 and users."isBanned" = false
                order by "${dto.sortBy}" ${dto.sortDirection}
                limit ${dto.pageSize} offset ${dto.skipSize}
                    `,
      [userId],
    );
    return result ?? null;
  }
  async countAllCommentsForAllUserBlogs(userId: string): Promise<number> {
    const result = await this.dataSource.query(
      `
                SELECT 
                CASE
                    WHEN COUNT(*) > 0 THEN COUNT(*)
                    ELSE 0
                END AS total
                FROM comments
                left join posts on posts.id = comments."postId"
                left join blogs on blogs.id = posts."blogId"
                left join users on users.id = blogs."userId"
                
                where users.id = $1
                    `,
      [userId],
    );
    return result[0].total ?? 0;
  }

  //// ORIGINAL FUNCTIONS ////

  async findCommentById(commentId: string) {
    // return this.commentModel.findById(id)
    const result = await this.dataSource.query(
      `
                SELECT comments.*
                FROM comments 
                left join users on users.id = comments."userId"
                WHERE comments.id = $1 and users."isBanned" = false
                    `,
      [commentId],
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
    dto: PaginationBasicDto,
  ): Promise<CommentEntity[]> {
    // return await this.commentModel.find({postId: postId}).skip(skipSize).limit(PageSize).exec();

    const result = await this.dataSource.query(
      `
                SELECT *
                FROM comments
                WHERE "postId" = $1
                ORDER BY "${dto.sortBy}" ${dto.sortDirection}
                LIMIT $2 OFFSET $3
                    `,
      [postId, dto.pageSize, dto.skipSize],
    );
    return result ?? null;
  }

  async countCommentsOnPost(postId: string, dto: PaginationBasicDto) {
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

  async mapCommentsToResponseForBlogger(
    allComments: CommentEntity[],
  ): Promise<CommentViewForBloggerDTO[]> {
    const mappedComments: CommentViewForBloggerDTO[] = [];
    for await (const comment of allComments) {
      mappedComments.push(await this.mapCommentToResponseForBlogger(comment));
    }
    return mappedComments;
  }

  async mapCommentToResponseForBlogger(
    comment: CommentEntity,
  ): Promise<CommentViewForBloggerDTO> {
    const post = await this.dataSource.query(
      `
    select posts.* 
    from  posts
    left join comments on posts.id = comments."postId"
    
    where comments.id = $1 
    `,
      [comment.id],
    );
    console.log(post[0]);
    const result = {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.userLogin,
      },
      createdAt: comment.createdAt,
      postInfo: {
        id: post[0].id,
        title: post[0].title,
        blogName: post[0].blogName,
        blogId: post[0].blogId,
      },
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: "None",
      },
    };
    return result;
  }
}
