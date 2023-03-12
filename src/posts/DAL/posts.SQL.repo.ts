import { Injectable } from "@nestjs/common";
import { CreatePostDto } from "../dto/create-post.dto";
import { UpdatePostDto } from "../dto/update-post.dto";
import { LikeStatusEnum } from "../../likes/LikeStatusEnum";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { IPostsRepo } from "./IPostsRepo";
import { PostEntity } from "../entities/post.entity";
import { BlogEntity } from "../../bloggers/entities/blogEntity";
import { PostViewModel } from "../dto/PostViewModel";
import { PaginationPostsDto } from "../dto/pagination.posts.dto";

@Injectable()
export class PostsSQLRepo implements IPostsRepo<PostEntity> {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  findPostById(id: string): Promise<PostEntity> {
    throw new Error("Method not implemented.");
  }
  countPosts(): Promise<number> {
    throw new Error("Method not implemented.");
  }
  countPostsByBlogId(blogId: string): Promise<number> {
    throw new Error("Method not implemented.");
  }
  getPostsPaginated(dto: PaginationPostsDto): Promise<PostEntity[]> {
    throw new Error("Method not implemented.");
  }
  getPostsPaginatedByBlog(dto: PaginationPostsDto, blogId: string) {
    throw new Error("Method not implemented.");
  }

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

  async createPost(dto: CreatePostDto, blog: BlogEntity) {
    // const newPost = await this.postModel.insertMany(post)

    const createdId = await this.dataSource.query(
      `
                INSERT INTO posts 
                (title, "shortDescription", content, "blogId", "blogName")
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id
                    `,
      [dto.title, dto.shortDescription, dto.content, blog.id, blog.name],
    );

    const result = await this.dataSource.query(
      `
                SELECT *
                FROM posts 
               WHERE id = $1
                    `,
      [createdId[0].id],
    );
    return result[0] ?? result;
  }

  async isPostExists(dto: CreatePostDto) {
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
                SELECT posts.*, blogs.name AS "bloggerName"
                FROM posts
                JOIN blogs ON posts."bloggerId" = blogs.id
                WHERE posts.id = $1
                    `,
      [id],
    );
    return result[0] ?? null;
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
    userId: string,
    dto: PaginationPostsDto,
  ) {
    // const posts = await this.postModel.find({bloggerId: bloggerId}).skip(skipSize).limit(PageSize).lean().exec();

    const result = await this.dataSource.query(
      `
                SELECT * 
                FROM posts
                JOIN likes ON post."extendedLikesInfo" = likes.postId
                WHERE "blogId" = $1
                ORDER BY id
                LIMIT $2 OFFSET $3
                    `,
      [bloggerId, dto.pageSize, dto.skipSize],
    );
    return result;
  }

  async getMyLikeInfo(userId: string, postId: string) {
    // return this.postModel.findOne({$and: [{userId: userId}, {_id: postId}]}).select({_id: 0, extendedLikesInfo: 1})
  }

  async setLikeStatus(postId: string, updateQuery: any) {
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

  async mapPostToView(post: PostEntity): Promise<PostViewModel> {
    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatusEnum.None,
        newestLikes: [],
      },
    };
  }
}
