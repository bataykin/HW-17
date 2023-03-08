import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { CreateBloggerDto } from "../dto/create.blogger.dto";
import { UpdateBlogDto } from "../dto/update-blog.dto";

@Injectable()
export class BloggersSQLRepo {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  //// ORIGINAL FUNCTIONS ////

  async getAllBloggersPaging(skipSize: number, PageSize: number) {
    // return await this.bloggerModel.find({}).skip(skipSize).limit(PageSize).exec();

    const result = await this.dataSource.query(
      `
                SELECT *
                FROM bloggers
                ORDER BY id
                LIMIT $1 OFFSET $2
                    `,
      [PageSize, skipSize],
    );
    return result;
  }

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

  async createBlogger(dto: CreateBloggerDto) {
    // return await this.bloggerModel.insertMany({name: dto.name, websiteUrl: dto.websiteUrl})

    const result = await this.dataSource.query(
      `
                INSERT INTO bloggers(name, "websiteUrl")
                VALUES ($1, $2)
                RETURNING *
                    `,
      [dto.name, dto.websiteUrl],
    );

    return result;
  }

  async isExists(dto: CreateBloggerDto) {
    // return this.bloggerModel.findOne({name: dto.name});

    const result = await this.dataSource.query(
      `
                SELECT name, "websiteUrl" 
                FROM bloggers
                WHERE bloggers.name = $1
                    `,
      [dto.name],
    );
    return result;
  }

  async findById(id: string) {
    // return this.bloggerModel.findById(id).select({_id: 0, id: '$_id', name: 1, websiteUrl: 1})

    const result = await this.dataSource.query(
      `
                SELECT * 
                FROM bloggers
                WHERE bloggers.id = $1
                    `,
      [id],
    );
    return result;
  }

  async updateBlogger(id: string, { name, websiteUrl }: UpdateBlogDto) {
    // return this.bloggerModel.findOneAndUpdate({_id: id}, {name, websiteUrl}, {new: true});

    const result = await this.dataSource.query(
      `
            UPDATE bloggers
            SET name = $1, "websiteUrl" = $2
            WHERE id = $3
            RETURNING *
            `,
      [name, websiteUrl, id],
    );
    return result;
  }

  async deleteBlogger(id: string) {
    // return this.bloggerModel.findByIdAndDelete(id)

    const result = await this.dataSource.query(
      `
                DELETE FROM bloggers
                WHERE bloggers.id = $1
                    `,
      [id],
    );
    return result;
  }

  async getBloggerNameById(bloggerId: string) {
    // return this.bloggerModel.findById(bloggerId, {_id:0, name: 1})

    const result = await this.dataSource.query(
      `
                SELECT name 
                FROM bloggers
                WHERE bloggers.id = $1
                    `,
      [bloggerId],
    );
    return result;
  }
}
