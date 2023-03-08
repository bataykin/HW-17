import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";
import { Blogger, BloggerDocument } from "../blogger.schema";
import { CreateBloggerDto } from "../dto/create.blogger.dto";
import { UpdateBlogDto } from "../dto/update-blog.dto";

@Injectable()
export class BloggersMongoRepo {
  constructor(
    @InjectModel(Blogger.name) private bloggerModel: Model<BloggerDocument>,
  ) {}

  async getAllBloggersPaging(skipSize: number, PageSize: number) {
    return await this.bloggerModel
      .find({})
      .skip(skipSize)
      .limit(PageSize)
      .exec();
  }

  async countDocuments(filter: FilterQuery<any>) {
    return this.bloggerModel.countDocuments(filter);
  }

  async createBlogger(dto: CreateBloggerDto) {
    return await this.bloggerModel.insertMany({
      name: dto.name,
      websiteUrl: dto.websiteUrl,
    });
  }

  async isExists(dto: CreateBloggerDto) {
    return this.bloggerModel.findOne({ name: dto.name });
  }

  async findById(id: string) {
    return this.bloggerModel
      .findById(id)
      .select({ _id: 0, id: '$_id', name: 1, websiteUrl: 1 });
  }

  async updateBlogger(id: string, { name, websiteUrl }: UpdateBlogDto) {
    return this.bloggerModel.findOneAndUpdate(
      { _id: id },
      { name, websiteUrl: websiteUrl },
      { new: true },
    );
  }

  async deleteBlogger(id: string) {
    return this.bloggerModel.findByIdAndDelete(id);
  }

  async getBloggerNameById(bloggerId: string) {
    return this.bloggerModel.findById(bloggerId, { _id: 0, name: 1 });
  }
}
