import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { CreateBlogDto } from "../dto/createBlogDto";
import { UpdateBlogDto } from "../dto/update-blog.dto";
import { IBlogsRepo } from "./IBlogsRepo";
import { BlogEntity } from "../entities/blogEntity";
import { BlogsPaginationDto } from "../dto/blogsPaginationDto";
import { BlogViewModel } from "../dto/BlogViewModel";

@Injectable()
export class BloggersSQLRepo implements IBlogsRepo<BlogEntity> {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async createBlog(dto: CreateBlogDto, userId: string): Promise<BlogEntity> {
    const result = await this.dataSource.query(
      `
                INSERT INTO blogs(name, description, "websiteUrl", "userId")
                VALUES ($1, $2, $3, $4)
                RETURNING *
                    `,
      [dto.name, dto.description, dto.websiteUrl, userId],
    );

    return result[0] ?? result;
  }
  async updateBlog(id: string, dto: UpdateBlogDto): Promise<BlogEntity> {
    const result = await this.dataSource.query(
      `
            UPDATE blogs
            SET name = $1, description = $2, "websiteUrl" = $3
            WHERE id = $4
            RETURNING *
            `,
      [dto.name, dto.description, dto.websiteUrl, id],
    );
    return result;
  }

  async deleteBlog(id: string): Promise<any> {
    const result = await this.dataSource.query(
      `
                DELETE FROM blogs
                WHERE id = $1
                    `,
      [id],
    );
    return result;
  }

  async findBlogById(id: string): Promise<BlogEntity | null> {
    const result = await this.dataSource.query(
      `
                SELECT * 
                FROM blogs
                WHERE id = $1
                    `,
      [id],
    );
    return result[0] ?? null;
  }
  SA_findBlogById(id: string): Promise<BlogEntity> {
    throw new Error("Method not implemented.");
  }
  countBlogs(): Promise<number> {
    throw new Error("Method not implemented.");
  }

  async getBlogsPaginatedPublic(
    dto: BlogsPaginationDto,
  ): Promise<BlogEntity[] | null> {
    const result = await this.dataSource.query(
      `
                SELECT * 
                FROM blogs
                WHERE 
                     
                case 
                when $3::text is null then true 
                when $3::text is not null then (upper("name") ~ $3::text)
                end 
                
                ORDER BY  "${dto.sortBy}"     ${dto.sortDirection}
                LIMIT $1 OFFSET $2;
                    `,
      [dto.pageSize, dto.skipSize, dto.searchNameTerm as string | null],
    );
    return result ?? null;
  }

  async getBlogsOfBloggerPaginated(
    dto: BlogsPaginationDto,
    userIdFromToken: string,
  ): Promise<BlogEntity[]> {
    const result =
      dto.sortBy == "createdAt"
        ? await this.dataSource.query(
            `
                SELECT * 
                FROM blogs
                WHERE "userId" = $1
                AND
                
                case 
                when $4::text is null then true 
                when $4::text is not null then (upper("name") ~ $4::text)
                end 
                
                ORDER BY  "${dto.sortBy}"     ${dto.sortDirection}
                LIMIT $2 OFFSET $3;
                    `,
            [userIdFromToken, dto.pageSize, dto.skipSize, dto.searchNameTerm],
          )
        : await this.dataSource.query(
            `
                SELECT * 
                FROM blogs
                WHERE "userId" = $1
                AND
                
                case 
                when $4::text is null then true 
                when $4::text is not null then (upper("name") ~ $4::text)
                end 
                
                ORDER BY  "${dto.sortBy}"::bytea     ${dto.sortDirection}
                LIMIT $2 OFFSET $3;
                    `,
            [userIdFromToken, dto.pageSize, dto.skipSize, dto.searchNameTerm],
          );
    return result;
  }

  isBlogExistsByName(dto: CreateBlogDto): Promise<BlogEntity> {
    throw new Error("Method not implemented.");
  }

  async getBlogNameById(id: string): Promise<string> {
    const result = await this.dataSource.query(
      `
                SELECT name 
                FROM blogs
                WHERE blogs.id = $1
                    `,
      [id],
    );
    return result[0].name ?? result;
  }

  async countBlogsBySearchnamePublic(searchNameTerm: string) {
    const result = await this.dataSource.query(
      `
                SELECT 
                CASE
                    WHEN COUNT(*) > 0 THEN COUNT(*)
                    ELSE 0
                END AS total
                FROM blogs
                WHERE 
                case 
                when $1::text is null then true 
                when $1::text is not null then (upper("name") ~ $1::text)
                end 
                    `,
      [searchNameTerm],
    );
    console.log(result);
    return result[0].total ?? null;
  }

  async countBloggersBlogsBySearchname(searchNameTerm: string, userId: string) {
    const result = await this.dataSource.query(
      `
                SELECT 
                CASE
                    WHEN COUNT(*) > 0 THEN COUNT(*)
                    ELSE 0
                END AS total
                FROM blogs
                WHERE "userId" = $1
                AND
                case 
                when $2::text is null then true 
                when $2::text is not null then (upper("name") ~ $2::text)
                end 
                    `,
      [userId, searchNameTerm],
    );
    return result[0].total ?? null;
  }
  SA_bindBlogToUser(blogId: string, userId: string) {
    throw new Error("Method not implemented.");
  }
  async mapBlogsToResponse(blogs: BlogEntity[]): Promise<BlogViewModel[]> {
    const mappedBlogs = [];
    for await (const blog of blogs) {
      mappedBlogs.push({
        id: blog.id,
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
        isMembership: blog.isMembership,
      });
    }

    return mappedBlogs;
  }
  async mapBlogToResponse(blog: BlogEntity): Promise<BlogViewModel> {
    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    } as BlogViewModel;
  }
  mapBlogsWithOwnersToResponse(blogs: BlogEntity[]) {
    throw new Error("Method not implemented.");
  }
  setBanStatus(blogId: string, isBanned: boolean): void {
    throw new Error("Method not implemented.");
  }
  SA_getBlogsPaginated(dto: BlogsPaginationDto): Promise<BlogEntity[]> {
    throw new Error("Method not implemented.");
  }
  SA_countBlogsBySearchname(searchNameTerm: string) {
    throw new Error("Method not implemented.");
  }

  //// ORIGINAL FUNCTIONS ////

  async countDocuments() {
    // return this.bloggerModel.countDocuments(filter);

    const result = await this.dataSource.query(
      `
                SELECT 
                CASE
                    WHEN COUNT(*) > 0 THEN COUNT(*)
                    ELSE 0
                END AS total
                FROM bloggers
                    `,
      [],
    );
    return result;
  }

  async isExists(dto: CreateBlogDto) {
    // return this.bloggerModel.findOne({name: dto.name});

    const result = await this.dataSource.query(
      `
                SELECT name, "websiteUrl" 
                FROM blogs
                WHERE blogs.name = $1
                    `,
      [dto.name],
    );
    return result;
  }
}
