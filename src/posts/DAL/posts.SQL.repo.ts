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
import { LikesEnum } from "../entities/likes.enum";
import { UserEntity } from "../../users/entity/user.entity";
import { BlogsPaginationDto } from "../../bloggers/dto/blogsPaginationDto";

@Injectable()
export class PostsSQLRepo implements IPostsRepo<PostEntity> {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findPostById(id: string): Promise<PostEntity> {
    const result = await this.dataSource.query(
      `
                SELECT *
                FROM posts
                Where id = $1
                    `,
      [id],
    );
    return result[0] ?? null;
  }

  async findPostByIdPublic(id: string): Promise<PostEntity> {
    const result = await this.dataSource.query(
      `
                SELECT posts.*
                FROM posts
                left join blogs on posts."blogId" = blogs.id
                Where posts.id = $1
                AND blogs."isBanned" = false
                    `,
      [id],
    );
    return result[0] ?? null;
  }

  async countPosts(): Promise<number> {
    const result = await this.dataSource.query(
      `
                SELECT count(*)
                FROM posts
                left join blogs on posts."blogId" = blogs.id
                Where blogs."isBanned" = false
                    `,
      [],
    );
    return result[0].count ?? 0;
  }

  async countPostsByBlogId(blogId: string): Promise<number> {
    const result = await this.dataSource.query(
      `
                SELECT count(*)
                FROM posts
                left join blogs on posts."blogId" = blogs.id
                Where blogs."isBanned" = false and blogs.id = $1
                    `,
      [blogId],
    );
    return result[0].count ?? 0;
  }

  async getPostsPaginated(dto: PaginationPostsDto): Promise<PostEntity[]> {
    const result = await this.dataSource.query(
      `
                SELECT posts.*
                FROM posts
                left join blogs on posts."blogId" = blogs.id
                Where blogs."isBanned" = false
                order by posts."${dto.sortBy}" ${dto.sortDirection}
                    `,
      [],
    );
    return result ?? null;
  }

  async getPostsPaginatedByBlog(
    dto: BlogsPaginationDto,
    blogId: string,
  ): Promise<PostEntity[]> {
    const result =
      dto.sortBy == "createdAt"
        ? await this.dataSource.query(
            `
                SELECT posts.*
                FROM posts
                left join blogs on posts."blogId" = blogs.id
                Where blogs."isBanned" = false AND blogs.id = $1
                and posts.title ~ upper($2)
                order by posts."${dto.sortBy}" ${dto.sortDirection}
                    `,
            [blogId, dto.searchNameTerm],
          )
        : await this.dataSource.query(
            `
                SELECT posts.*
                FROM posts
                left join blogs on posts."blogId" = blogs.id
                Where blogs."isBanned" = false AND blogs.id = $1
                and posts.title ~ upper($2)
                order by posts."${dto.sortBy}"::bytea ${dto.sortDirection}
                    `,
            [blogId, dto.searchNameTerm],
          );
    return result ?? null;
  }

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
                WHERE id = $1
                    `,
      [id],
    );
    return result[0] ?? result;
  }

  async mapPostToView(
    post: PostEntity,
    user: UserEntity,
  ): Promise<PostViewModel> {
    const myStatus: LikeStatusEnum = user
      ? await this.dataSource
          .query(
            `
    select 
    reaction
    from likes
   
    where "postId" = $1 and "userId" = $2
    `,
            [post.id, user.id],
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
    where likes."postId" = $1 and users."isBanned" = false
    `,
      [post.id],
    );

    const newLikes = await this.dataSource.query(
      `
    select likes."addedAt", likes."userId", users.login
    from likes
    left join users on users.id = likes."userId"
    where likes."postId" = $1 AND likes."reaction" = '${LikeStatusEnum.Like}'
    and users."isBanned" = false
    order by "updatedAt" desc
    LIMIT 3
    `,
      [post.id],
    );

    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: +likes[0]?.likesCount ?? 0,
        dislikesCount: +likes[0]?.dislikesCount ?? 0,
        myStatus: myStatus,
        newestLikes: newLikes,
      },
    };
  }

  async mapPostsToView(
    posts: PostEntity[],
    user: UserEntity | null,
  ): Promise<PostViewModel[]> {
    const mappedPosts = [];
    for (const post of posts) {
      mappedPosts.push(await this.mapPostToView(post, user));
    }
    return mappedPosts;
  }
}
