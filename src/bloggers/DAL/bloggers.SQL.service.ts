import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { BloggersSQLRepo } from "./bloggers.SQL.repo";
import { BlogsPaginationDto } from "../dto/blogsPaginationDto";
import { CreateBloggerDto } from "../dto/create.blogger.dto";
import { UpdateBlogDto } from "../dto/update-blog.dto";
import { ABloggersService } from "./IBloggerService";

@Injectable()
export class BloggersSQLService implements ABloggersService {
  constructor(protected readonly bloggersRepo: BloggersSQLRepo) {
    // console.log('from BloggersSQLService: ', process.env.REPO_TYPE)
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
    const docCount = await this.bloggersRepo.countDocuments();
    const result = {
      pagesCount: Math.ceil(docCount[0].total / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: docCount[0].total,
      items: bloggers,
    };
    return result;
  }

  async create(dto: CreateBloggerDto) {
    const isExists = await this.bloggersRepo.isExists(dto);
    if (isExists.length > 0) {
      throw new BadRequestException("takoi blogger exists");
    }
    const newBlogger = await this.bloggersRepo.createBlogger(dto);

    return newBlogger[0];
  }

  async findById(id: string) {
    try {
      const blogger = await this.bloggersRepo.findById(id);
      if (blogger.length == 0) {
        throw new NotFoundException("net takogo blogerka");
      }
      return blogger[0];
    } catch (e) {
      if (e.name == "NotFoundException") {
        throw new NotFoundException("net takogo blogerka");
      } else throw new BadRequestException(e);
    }
  }

  async update(id: string, dto: UpdateBlogDto) {
    try {
      const blogger = await this.bloggersRepo.findById(id);
      if (blogger.length == 0) {
        throw new NotFoundException("net takogo blogerka");
      }
    } catch (e) {
      if (e.name == "NotFoundException") {
        throw new NotFoundException("net takogo blogerka");
      } else throw new BadRequestException(e);
    }

    const result = await this.bloggersRepo.updateBlogger(id, dto);
    return result[0][0];
  }

  async remove(id: string) {
    try {
      const blogger = await this.bloggersRepo.findById(id);
      if (blogger.length == 0) {
        throw new NotFoundException("net takogo blogerka");
      }
    } catch (e) {
      if (e.name == "NotFoundException") {
        throw new NotFoundException("net takogo blogerka");
      } else throw new BadRequestException(e);
    }

    const result = await this.bloggersRepo.deleteBlogger(id);
    return result;
  }

  async getBloggerNameById(bloggerId: string) {
    const bloggerName = await this.bloggersRepo.getBloggerNameById(bloggerId);
    return bloggerName[0].name;
  }
}
