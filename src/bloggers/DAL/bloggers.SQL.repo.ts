import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { CreateBlogDto } from "../dto/createBlogDto";
import { UpdateBlogDto } from "../dto/update-blog.dto";
import { IBlogsRepo } from "./IBlogsRepo";
import { BlogEntity } from "../entities/blogEntity";
import { BlogsPaginationDto } from "../dto/blogsPaginationDto";
import { BlogViewModel } from "../dto/BlogViewModel";
import { SA_BlogViewModel } from "../../superadmin/dto/SA_BlogViewModel";

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

  async findBlogByIdPublic(id: string): Promise<BlogEntity | null> {
    const result = await this.dataSource.query(
      `
                SELECT * 
                FROM blogs
                WHERE id = $1
                and "isBanned" = false
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
    const result =
      dto.sortBy == "createdAt"
        ? await this.dataSource.query(
            `
                SELECT * 
                FROM blogs
                WHERE 
                     
                case 
                when $3::text is null then true 
                when $3::text is not null then (upper("name") ~ $3::text)
                end 
                
                AND "isBanned" = false
                
                
                ORDER BY  "${dto.sortBy}"     ${dto.sortDirection}
                LIMIT $1 OFFSET $2;
                    `,
            [dto.pageSize, dto.skipSize, dto.searchNameTerm as string | null],
          )
        : await this.dataSource.query(
            `
                SELECT * 
                FROM blogs
                WHERE 
                     
                case 
                when $3::text is null then true 
                when $3::text is not null then (upper("name") ~ $3::text)
                end 
                
                AND "isBanned" = false
                
                
                ORDER BY  "${dto.sortBy}" collate "C"     ${dto.sortDirection}
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
                
                AND "isBanned" = false
                    `,
      [searchNameTerm],
    );
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
      mappedBlogs.push(await this.mapBlogToResponse(blog));
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

  async SA_SetBlogBanStatus(
    blogId: string,
    isBanned: boolean,
  ): Promise<BlogEntity> {
    const result = await this.dataSource.query(
      `
                UPDATE blogs
                SET "isBanned" = $1, 
                "banDate" = (
                CASE WHEN $1 = true then $2::timestamptz
                ELSE NULL END)
                WHERE id = $3
                    `,
      [isBanned, new Date(), blogId],
    );
    return result[0] ?? result;
  }

  async SA_GetBlogs(dto: BlogsPaginationDto): Promise<BlogEntity[]> {
    const blogs =
      dto.sortBy == "createdAt"
        ? await this.dataSource.query(
            `
            SELECT * 
            FROM blogs 
            WHERE
            case 
                when $3::text is null then true 
                when $3::text is not null then (upper("name") ~ $3::text)
                end 
        
            ORDER BY  blogs."${dto.sortBy}"     ${dto.sortDirection}
             LIMIT $1 OFFSET $2;
        `,
            [dto.pageSize, dto.skipSize, dto.searchNameTerm],
          )
        : await this.dataSource.query(
            `
            SELECT * 
            FROM blogs 
            WHERE
            case 
                when $3::text is null then true 
                when $3::text is not null then (upper("name") ~ $3::text)
                end 
             
            ORDER BY  blogs."${dto.sortBy}"::bytea     ${dto.sortDirection}
             LIMIT $1 OFFSET $2;
        `,
            [dto.pageSize, dto.skipSize, dto.searchNameTerm],
          );
    return blogs;
  }

  async SA_mapBlogsToResponse(blogs: any): Promise<SA_BlogViewModel[]> {
    const mappedBlogs = [];
    for await (const blog of blogs) {
      const blogOwnerLogin = await this.dataSource.query(
        `
          select login from users
          left join blogs on blogs."userId" = users.id  
          where blogs."id" = $1   
      `,
        [blog.id],
      );
      mappedBlogs.push({
        id: blog.id,
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
        isMembership: blog.isMembership,
        blogOwnerInfo: {
          userId: blog.userId,
          userLogin: blogOwnerLogin[0].login,
        },

        banInfo: {
          isBanned: blog.isBanned,
          banDate: blog.banDate,
        },
      });
    }
    return mappedBlogs;
  }

  async SA_countBlogsBySearchname(searchNameTerm: string) {
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
    return result[0].total ?? result;
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
                FROM blogs
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

  SA_mapBlogToResponse(blogs: any): Promise<SA_BlogViewModel[]> {
    return Promise.resolve([]);
  }
}
