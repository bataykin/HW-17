import {CreatePostByBloggerDto} from "../../bloggers/dto/create.post.by.blogger.dto";
import {BadRequestException, NotFoundException} from "@nestjs/common";
import {LikeStatusEnum} from "../../comments/comment.schema";
import {CreatePostDto} from "../dto/create-post.dto";
import {PaginationPostsDto} from "../dto/pagination.posts.dto";
import {UpdatePostDto} from "../dto/update-post.dto";

export interface IPostService {
    getPostsByBlogger(bloggerId: string, userId: string, PageNumber: number, PageSize: number): any,

    createPostByBlogger(bloggerId: string, {title, shortDescription, content}: CreatePostByBloggerDto): any,

    create(dto: CreatePostDto): any,

    findAll({pageNumber, pageSize}: PaginationPostsDto, userId?: string): any,

    findPostById(id: string, userId?: string): any,

    update(id: string, dto: UpdatePostDto): any,

    remove(id: string): any,

    setLikeStatus(userId: string, postId: string, likeStatus: LikeStatusEnum): any,

    findPostByIdOnUserId(postId: string, userId: string): any
}

export const IPostServiceToken = Symbol("IPostService");

export abstract class APostService {
    abstract getPostsByBlogger(bloggerId: string, userId: string, PageNumber: number, PageSize: number): any;

    abstract createPostByBlogger(bloggerId: string, {title, shortDescription, content}: CreatePostByBloggerDto): any;

    abstract create(dto: CreatePostDto): any;

    abstract findAll({pageNumber, pageSize}: PaginationPostsDto, userId?: string): any;

    abstract findPostById(id: string, userId?: string): any;

    abstract update(id: string, dto: UpdatePostDto): any;

    abstract remove(id: string): any;

    abstract setLikeStatus(userId: string, postId: string, likeStatus: LikeStatusEnum): any;

    abstract findPostByIdOnUserId(postId: string, userId: string): any
}