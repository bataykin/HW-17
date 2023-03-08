import { Injectable } from "@nestjs/common";
import { UpdateQuery } from "mongoose";
import { CreatePostDto } from "../dto/create-post.dto";
import { UpdatePostDto } from "../dto/update-post.dto";
import { LikeStatusEnum } from "../../likes/LikeStatusEnum";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { LikesSQLService } from "../../likes/oldServiceRepos/likes.SQL.service";

@Injectable()
export class PostsSQLRepo {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly likesService: LikesSQLService,
  ) {}

  //// ORIGINAL FUNCTIONS ////

  async getAllPosts(skipSize: number, PageSize: number | 10) {
    // const posts = await this.postModel.find({}).skip(skipSize).limit(PageSize).exec();

    const result = await this.dataSource.query(
      `
                SELECT *
                FROM posts
                ORDER BY id
                LIMIT $1 OFFSET $2
                    `,
      [PageSize, skipSize],
    );
    return result;
  }

  // async getAllPostsByAuthUser(userId: string, skipSize: number, PageSize: number | 10) {
  //     // const posts = await this.postModel.find({}).skip(skipSize).limit(PageSize).exec();
  //     const result = await this.dataSource.query(`
  //             SELECT *
  //             FROM posts
  //             ORDER BY id
  //             LIMIT $1 OFFSET $2
  //                 `, [PageSize, skipSize])
  //
  //     // const mappedPosts = posts.map(async (p) => {
  //     //     let userReactionStatus: LikeStatusEnum = LikeStatusEnum.None
  //     //     userReactionStatus = await this.usersRepo.getUsersReactionOnPost(p._id, userId)
  //     //     // console.log('userReactionStatus', userReactionStatus)
  //     //
  //     //     p.extendedLikesInfo.myStatus = userReactionStatus
  //     //
  //     //     // console.log(p.extendedLikesInfo)
  //     //     const maPost = {
  //     //         id: p._id,
  //     //         title: p.title,
  //     //         shortDescription: p.shortDescription,
  //     //         content: p.content,
  //     //         bloggerId: p.bloggerId,
  //     //         bloggerName: p.bloggerName,
  //     //         addedAt: p.addedAt,
  //     //         extendedLikesInfo: p.extendedLikesInfo
  //     //     }
  //     //     // console.log(maPost)
  //     //     return maPost
  //     // })
  //     // console.log(mappedPosts)
  //     //
  //     // return Promise.all(mappedPosts)
  //
  // }

  async countDocuments() {
    // return this.postModel.countDocuments(filter);

    const result = await this.dataSource.query(
      `
                SELECT 
                CASE
                    WHEN COUNT(*) > 0 THEN COUNT(*)
                    ELSE 0
                END AS total
                FROM posts
                    `,
      [],
    );

    // console.log(result[0].total)

    return result;
  }

  async create(post: {
    addedAt: Date;
    bloggerName: string;
    shortDescription: string;
    title: string;
    content: string;
    bloggerId: string;
    extendedLikesInfo: {
      likesCount: number;
      newestLikes: any[];
      dislikesCount: number;
      myStatus: string;
    };
  }) {
    // const newPost = await this.postModel.insertMany(post)

    const createdId = await this.dataSource.query(
      `
                INSERT INTO posts 
                (title, "shortDescription", content, "bloggerId")
                VALUES ($1, $2, $3, $4)
                RETURNING id
                    `,
      [post.title, post.shortDescription, post.content, post.bloggerId],
    );

    const result = await this.dataSource.query(
      `
                SELECT posts.*, bloggers.name AS "bloggerName"
                FROM posts 
                JOIN bloggers ON posts."bloggerId" = bloggers.id
                WHERE posts.id = $1
                    `,
      [createdId[0].id],
    );
    return result;
  }

  async isExists(dto: CreatePostDto) {
    // return this.postModel.findOne({$and: [{title: dto.title}, {bloggerId: dto.bloggerId}]});

    const result = await this.dataSource.query(
      `
                SELECT title, "bloggerId" 
                FROM posts
                WHERE (title = $1 AND "bloggerId" = $2)
                    `,
      [dto.title, dto.blogId],
    );
    return result;
  }

  async findById(id: string) {
    const result = await this.dataSource.query(
      `
                SELECT posts.*, bloggers.name AS "bloggerName"
                FROM posts
                JOIN bloggers ON posts."bloggerId" = bloggers.id
                WHERE posts.id = $1
                    `,
      [id],
    );
    return result;
    // const result = await this.dataSource.query(`
    //        SELECT *
    //         FROM posts
    //         JOIN bloggers ON posts."bloggerId" = bloggers.id
    //         JOIN likes ON likes."postId" = posts.id
    //         WHERE posts.id = $1
    //             `, [id])
    // return result
  }

  async updatePost(id: string, dto: UpdatePostDto) {
    const result = await this.dataSource.query(
      `
            UPDATE posts
            SET title = $1, "shortDescription" = $2, content = $3
            WHERE id = $4
            RETURNING *
            `,
      [dto.title, dto.shortDescription, dto.content, id],
    );
    return result;
  }

  async deletePost(id: string) {
    // return this.postModel.findByIdAndDelete(id)
    const result = await this.dataSource.query(
      `
                DELETE FROM posts
                WHERE posts.id = $1
                    `,
      [id],
    );
    return result;
  }

  async getPostByBloggerId(
    bloggerId: string,
    userId,
    skipSize: number,
    PageSize: number,
  ) {
    // const posts = await this.postModel.find({bloggerId: bloggerId}).skip(skipSize).limit(PageSize).lean().exec();

    const result = await this.dataSource.query(
      `
                SELECT * 
                FROM posts
                JOIN likes ON post."extendedLikesInfo" = likes.postId
                WHERE "bloggerId" = $1
                ORDER BY id
                LIMIT $2 OFFSET $3
                    `,
      [bloggerId, PageSize, skipSize],
    );
    return result;
  }

  async getMyLikeInfo(userId: string, postId: string) {
    // return this.postModel.findOne({$and: [{userId: userId}, {_id: postId}]}).select({_id: 0, extendedLikesInfo: 1})
  }

  async setLikeStatus(postId: string, updateQuery: UpdateQuery<any>) {
    // return this.postModel.findByIdAndUpdate(postId, updateQuery, {new: true})
  }

  async updatePostWithLike(
    postId: string,
    totalLikes: number,
    totalDislikes: number,
    last3Likes: any,
    likeStatus: LikeStatusEnum,
  ) {
    // return this.postModel.findByIdAndUpdate(postId,
    //     {
    //         'extendedLikesInfo.likesCount': totalLikes,
    //         'extendedLikesInfo.dislikesCount': totalDislikes,
    //         'extendedLikesInfo.myStatus': LikeStatusEnum.None,
    //         'extendedLikesInfo.newestLikes': last3Likes
    //     },
    //     {new: true})
  }
}
