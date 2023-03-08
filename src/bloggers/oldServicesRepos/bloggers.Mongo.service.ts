import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateBloggerDto } from "../dto/create.blogger.dto";
import { UpdateBlogDto } from "../dto/update-blog.dto";
import { BlogsPaginationDto } from "../dto/blogsPaginationDto";
import { BloggersMongoRepo } from "./bloggers.Mongo.repo";
import { ABloggersService } from "./IBloggerService";

@Injectable()
export class BloggersMongoService implements ABloggersService {
  constructor(
    protected readonly bloggersRepo: BloggersMongoRepo, // protected readonly bloggersRepo: BloggersSQLRepo
  ) {
    // console.log('from BloggersService: ', process.env.REPO_TYPE)
  }

  async findAll({
    searchNameTerm = null,
    pageNumber = 1,
    pageSize = 10,
  }: BlogsPaginationDto) {
    const skipSize = pageNumber > 1 ? pageSize * (pageNumber - 1) : 0;
    const bloggers = await this.bloggersRepo.getAllBloggersPaging(
      skipSize,
      pageSize,
    );
    const mappedBloggers = bloggers.map((b) => {
      return { id: b.id, name: b.name, websiteUrl: b.websiteUrl };
    });
    const docCount = await this.bloggersRepo.countDocuments({});
    const result = {
      pagesCount: Math.ceil(docCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: docCount,
      items: mappedBloggers,
    };
    return result;
  }

  async create(dto: CreateBloggerDto) {
    const isExists = await this.bloggersRepo.isExists(dto);
    // if (isExists) {
    //     throw new BadRequestException('takoi blogger exists')
    // }
    const newBlogger = await this.bloggersRepo.createBlogger(dto);
    const mappedBlogger = newBlogger.map((b) => {
      return { id: b._id, name: b.name, websiteUrl: b.websiteUrl };
    });
    return mappedBlogger[0];
  }

  async findById(id: string) {
    try {
      const blogger = await this.bloggersRepo.findById(id);
      if (!blogger) {
        throw new NotFoundException('net takogo blogerka');
      }
      return blogger;
    } catch (e) {
      if (e.name == 'NotFoundException') {
        throw new NotFoundException('net takogo blogerka');
      } else if (e.name == 'CastError') {
        throw new NotFoundException(
          'bloggerID (CastError), give me real ObjectID of bloggerID',
        );
      } else throw new BadRequestException(e);
    }
  }

  async update(id: string, dto: UpdateBlogDto) {
    try {
      const blogger = await this.bloggersRepo.findById(id);
      if (!blogger) {
        throw new NotFoundException('net takogo blogerka');
      }
    } catch (e) {
      if (e.name == 'NotFoundException') {
        throw new NotFoundException('net takogo blogerka');
      } else if (e.name == 'CastError') {
        throw new NotFoundException(
          'CastError, mf, give me real ObjectID of bloggerID',
        );
      } else throw new BadRequestException(e);
    }

    const result = await this.bloggersRepo.updateBlogger(id, dto);
    return result;
  }

  async remove(id: string) {
    try {
      const blogger = await this.bloggersRepo.findById(id);
      if (!blogger) {
        throw new NotFoundException('net takogo blogerka');
      }
    } catch (e) {
      if (e.name == 'NotFoundException') {
        throw new NotFoundException('net takogo blogerka');
      } else if (e.name == 'CastError') {
        throw new NotFoundException('CastError, mf, give me real ObjectID');
      } else throw new BadRequestException(e);
    }

    const result = await this.bloggersRepo.deleteBlogger(id.toString());
    return result;
  }

  async getBloggerNameById(bloggerId: string) {
    const bloggerName = await this.bloggersRepo.getBloggerNameById(bloggerId);
    return bloggerName.name;
  }
}
