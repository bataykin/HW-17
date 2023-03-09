import { Repository } from "typeorm";
import { PostEntity } from "./entities/post.entity";
import { IPostsRepo } from "./DAL/IPostsRepo";
import { InjectRepository } from "@nestjs/typeorm";
import { CreatePostDto } from "./dto/create-post.dto";
import { PaginationPostsDto } from "./dto/pagination.posts.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { PostDalDto } from "./dto/post.dal.dto";

export class PostsORM
  extends Repository<PostEntity>
  implements IPostsRepo<PostEntity>
{
  constructor(
    @InjectRepository(PostEntity)
    private readonly postsRepo: Repository<PostEntity>,
  ) {
    super(PostEntity, postsRepo.manager, postsRepo.queryRunner);
  }

  async countPostsByBlogId(blogId: string): Promise<number> {
    return await this.postsRepo.count({
      where: {
        blogId: blogId,
      },
    });
  }

  async createPost(post: PostDalDto): Promise<PostEntity> {
    const newpost = new PostEntity();
    newpost.title = post.title;
    newpost.shortDescription = post.shortDescription;
    newpost.content = post.content;
    newpost.blogId = post.blogId;
    newpost.blogName = post.blogName;
    await this.postsRepo.manager.save(newpost);
    return newpost;
  }

  async deletePost(id: string): Promise<any> {
    return await this.postsRepo.delete({ id });
  }

  async findPostById(id: string): Promise<PostEntity | null> {
    const result = await this.postsRepo.findOneBy({
      id,
      blogger: { isBanned: false },
    });
    return result;
  }

  async getPostByBloggerId(
    bloggerId: string,
    userId: string,
    dto: PaginationPostsDto,
  ): Promise<PostEntity | null> {
    return Promise.resolve(undefined);
  }

  async getPostsPaginated(dto: PaginationPostsDto): Promise<PostEntity[]> {
    const posts = await this.postsRepo
      .createQueryBuilder("posts")
      .leftJoinAndSelect("posts.blogger", "blogs")
      .where("blogs.isBanned = false")
      .skip(dto.skipSize)
      .take(dto.pageSize)
      .orderBy(
        "posts." + dto.sortBy,
        dto.sortDirection === "asc" ? "ASC" : "DESC",
        "NULLS LAST",
      )
      .getMany();
    return posts;
  }

  async isPostExists(dto: CreatePostDto): Promise<PostEntity | null> {
    // const result = await this.postsRepo.findOneBy({title: dto.title, blogId: dto.blogId})
    //
    // const result = await this.postsRepo.createQueryBuilder('posts')
    //     .select(['posts.title', 'posts.blogId'])
    //     .where('title =:title', {title: dto.title})
    //     .andWhere('blogId=:blogId', {blogId: dto.blogId})
    //     .getOne()
    return null;
  }

  async updatePost(id: string, dto: UpdatePostDto): Promise<any> {
    const res = await this.postsRepo.update(
      { id: id },
      {
        title: dto.title,
        content: dto.content,
        shortDescription: dto.shortDescription,
        blogId: dto.blogId,
      },
    );
    return res;
  }

  async countPosts(): Promise<number> {
    return await this.postsRepo.count();
  }

  async getPostsPaginatedByBlog(dto: PaginationPostsDto, blogId: string) {
    // let x = await this.postsRepo.find({
    //     relations: {blogger: true},
    //     where: {
    //         blogger: {
    //             isBanned: false
    //         }
    //     }
    // })
    // console.log(x)

    const posts = await this.postsRepo
      .createQueryBuilder("posts")
      .leftJoinAndSelect("posts.blogger", "blogs")
      // .addFrom(BlogEntity, 'blogs')
      .where("posts.blogId = :blogId", { blogId })
      .andWhere("blogs.isBanned = false")
      .skip(dto.skipSize)
      .take(dto.pageSize)
      .orderBy(
        "posts." + dto.sortBy,
        dto.sortDirection === "asc" ? "ASC" : "DESC",
        "NULLS LAST",
      )
      .getMany();
    // console.log(posts)
    return posts;
  }
}
