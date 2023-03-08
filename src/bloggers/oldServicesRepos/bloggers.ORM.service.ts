import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { BloggersORMRepo } from "./bloggers.ORM.repo";
import { ABloggersService } from "./IBloggerService";
import { CreateBloggerDto } from "../dto/create.blogger.dto";
import { BlogsPaginationDto } from "../dto/blogsPaginationDto";
import { UpdateBlogDto } from "../dto/update-blog.dto";

@Injectable()
export class BloggersORMService implements ABloggersService{
    constructor(
        protected readonly bloggersRepo: BloggersORMRepo
    ) {    }

    async create(dto: CreateBloggerDto): Promise<any> {
        const isExists = await this.bloggersRepo.isExists(dto)
        if (isExists) {
            throw new BadRequestException('takoi blogger exists')
        }
        return await this.bloggersRepo.createBlogger(dto)

    }

    async findAll({searchNameTerm = null, pageNumber = 1, pageSize = 10}: BlogsPaginationDto): Promise<any> {
        const skipSize = (pageNumber > 1) ? (pageSize * (pageNumber - 1)) : 0
        const bloggers = await this.bloggersRepo.getAllBloggersPaging(skipSize, pageSize)
        const docCount = await this.bloggersRepo.countDocuments()
        const result = {
            "pagesCount": Math.ceil(docCount / pageSize),
            "page": pageNumber,
            "pageSize": pageSize,
            "totalCount": docCount,
            "items": bloggers
        }
        return result
    }

    async findById(id: string){
        try {
            const blogger = await this.bloggersRepo.findById(id)
            if (!blogger) {
                throw new NotFoundException('net takogo blogerka')
            }
            return blogger
        } catch (e) {
            if (e.name == 'NotFoundException') {
                throw new NotFoundException('net takogo blogerka')
            } else throw new BadRequestException(e)
        }
    }

    async getBloggerNameById(bloggerId: string) {
        const bloggerName = await this.bloggersRepo.getBloggerNameById(bloggerId)
        return bloggerName
    }

    async remove(id: string): Promise<any> {

        try {
            const blogger = await this.bloggersRepo.findById(id)
            if (!blogger) {
                throw new NotFoundException('net takogo blogerka')
            }
        } catch (e) {
            if (e.name == 'NotFoundException') {
                throw new NotFoundException('net takogo blogerka')
            } else throw new BadRequestException(e)
        }

        const result = await this.bloggersRepo.deleteBlogger(id)
        return result
    }

    async update(id: string, dto: UpdateBlogDto): Promise<any> {
        try {
            const blogger = await this.bloggersRepo.findById(id)
            if (!blogger) {
                throw new NotFoundException('net takogo blogerka')
            }
        } catch (e) {
            if (e.name == 'NotFoundException') {
                throw new NotFoundException('net takogo blogerka')
            } else
                throw new BadRequestException(e)
        }

        const result = await this.bloggersRepo.updateBlogger(id, dto)
        return result
    }
}