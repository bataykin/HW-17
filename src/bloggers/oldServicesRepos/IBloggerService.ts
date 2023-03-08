import {BlogsPaginationDto} from "../dto/blogsPaginationDto";
import {CreateBloggerDto} from "../dto/create.blogger.dto";
import {BadRequestException, NotFoundException} from "@nestjs/common";
import {UpdateBlogDto} from "../dto/update-blog.dto";

export interface IBloggerService {
    findAll(dto: BlogsPaginationDto): any,
    create(dto: CreateBloggerDto): any,
    findById(id: string): any,
    update(id: string, dto: UpdateBlogDto): any,
    remove(id: string): any,
    getBloggerNameById(bloggerId: string): any
}

export const IBloggerServiceToken = Symbol("IBloggerService");


export abstract class ABloggersService {
    abstract findAll(dto: BlogsPaginationDto): any;
    abstract create(dto: CreateBloggerDto): any;
    abstract findById(id: string): any;
    abstract  update(id: string, dto: UpdateBlogDto): any;
    abstract  remove(id: string): any;
    abstract getBloggerNameById(bloggerId: string): any
}