import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BlogEntity } from "../entities/blogEntity";
import { CreateBloggerDto } from "../dto/create.blogger.dto";
import { UpdateBlogDto } from "../dto/update-blog.dto";

@Injectable()
export class BloggersORMRepo {
  constructor(
    @InjectRepository(BlogEntity)
    private readonly bloggersRepository: Repository<BlogEntity>,
  ) {}

  async createBlogger(dto: CreateBloggerDto) {
    // const blogger  = this.dataSource.getRepository(BloggerEntity).create(dto)
    // const blogger = await this.bloggersRepository.createQueryBuilder('bloggers')
    //     .insert()
    //     .values([
    //         {name: dto.name, websiteUrl: dto.websiteUrl}
    //     ])
    //     .execute()

    const blogger = new BlogEntity();
    blogger.name = dto.name;
    blogger.websiteUrl = dto.websiteUrl;
    await this.bloggersRepository.manager.save(blogger);

    return blogger;
  }

  async countDocuments() {
    return this.bloggersRepository.count();
  }

  async getAllBloggersPaging(skipSize: number, PageSize: number | 10) {
    // let bloggers = await this.bloggersRepository.find();
    const bloggers = await this.bloggersRepository
      .createQueryBuilder('bloggers')
      // .where("bloggers.name = :" )

      .skip(skipSize)
      .take(PageSize)
      .orderBy('bloggers.id')
      .getMany();
    // console.log(bloggers)
    return bloggers;
  }

  async isExists(dto: CreateBloggerDto) {
    // const blogger = this.bloggersRepository.createQueryBuilder()
    //     .select(dto.name)
    //     .from(BloggerEntity, 'bloggers')
    //     .where('bloggers.name', )

    const blogger = await this.bloggersRepository.findOneBy({ name: dto.name });

    return blogger;
  }

  async findById(id: string) {
    return await this.bloggersRepository.findOneBy({ id });
  }

  async deleteBlogger(id: string) {
    return await this.bloggersRepository.delete(id);
  }

  async getBloggerNameById(bloggerId: string) {
    const blogger = await this.bloggersRepository.findOneBy({ id: bloggerId });
    return blogger.name;
  }

  async updateBlogger(id: string, dto: UpdateBlogDto) {
    const blogger = await this.bloggersRepository.update(
      { id: id },
      { name: dto.name, websiteUrl: dto.websiteUrl },
    );
    return blogger;
  }
}
