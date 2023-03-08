import {BadRequestException, Injectable, NotFoundException} from "@nestjs/common";
import {APostService} from "./IPostService";
import {CreatePostDto} from "../dto/create-post.dto";
import {CreatePostByBloggerDto} from "../../bloggers/dto/create.post.by.blogger.dto";
import {PaginationPostsDto} from "../dto/pagination.posts.dto";
import {LikeStatusEnum} from "../../comments/comment.schema";
import {UpdatePostDto} from "../dto/update-post.dto";
import {UsersORMRepo} from "../../users/oldServiceRepos/users.ORM.repo";
import {BloggersORMService} from "../../bloggers/oldServicesRepos/bloggers.ORM.service";
import {LikesORMService} from "../../likes/oldServiceRepos/likes.ORM.service";
import {PostORMRepo} from "./post.ORM.repo";


@Injectable()
export class PostsORMService implements APostService{
    constructor(protected readonly postsRepo: PostORMRepo,
                // protected readonly usersRepo: UsersORMRepo,
                protected readonly bloggersService: BloggersORMService,
                protected readonly likesService: LikesORMService) {
    }

    async create(dto: CreatePostDto): Promise<any> {
        const isPostAlreadyExists = await this.postsRepo.isExists(dto)
        if (isPostAlreadyExists) {
            throw new BadRequestException('takoi post exists')
        }

        const {title, shortDescription, content, blogId} = dto
        await this.bloggersService.findById(blogId)
        const bloggerName = await this.bloggersService.getBloggerNameById(blogId)
        let post = {
            title: title,
            shortDescription: shortDescription,
            content: content,
            bloggerId: blogId,
            bloggerName: bloggerName,
            addedAt: new Date(),
            extendedLikesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: 'None',
                newestLikes: []
            },
            id: undefined
        }
        // console.log(post)
        // const newPost = await this.postsRepo.createPost(post)
        // newPost[0].extendedLikesInfo = post.extendedLikesInfo
        // console.log('newPost', newPost)

        return {
            title: 'newPost.title',
            shortDescription: 'newPost.shortDescription',
            content: 'newPost.content',
            bloggerId: 'newPost.bloggerId'}
    }

    async createPostByBlogger(bloggerId: string, {title, shortDescription, content}: CreatePostByBloggerDto): Promise<any> {
    }

    async findAll({pageNumber = 1, pageSize = 10 }: PaginationPostsDto, userId?: string): Promise<any> {
        const skipSize = (pageNumber > 1) ? (pageSize * (pageNumber - 1)) : 0
        const posts = await this.postsRepo.getAll(skipSize, pageSize)
        //TODO ADd extendedLikesInfo compilation
        const docCount = await this.postsRepo.count()
        const result = {
            "pagesCount": Math.ceil(docCount / pageSize),
            "page": pageNumber,
            "pageSize": pageSize,
            "totalCount": docCount,
            "items": posts
        }

        return result
    }

    async findPostById(id: string, userId?: string): Promise<any> {
        try {
            const post = await this.postsRepo.findById(id)
            if (!post) {
                throw new NotFoundException('net takogo posta')
            }
            // post.extendedLikesInfo = await this.likesService.getPostLikeInfo(userId, id)
            return post
        } catch (e: any) {
            if (e.name == 'NotFoundException') {
                throw new NotFoundException('net takogo posta')
            } else throw new NotFoundException(e.message)
        }
    }

    async findPostByIdOnUserId(postId: string, userId: string): Promise<any> {
    }

    async getPostsByBlogger(bloggerId: string, userId: string, PageNumber: number, PageSize: number): Promise<any> {
    }

    async remove(id: string): Promise<any> {
        try {
            const post = await this.findPostById(id)
            if (!post) {
                throw new NotFoundException('net takogo posta')
            }
        } catch (e) {
            if (e.name == 'NotFoundException') {
                throw new NotFoundException('net takogo posta')
            } else throw new BadRequestException(e)
        }

        const result = await this.postsRepo.deletePost(id)
        return result
    }

    async setLikeStatus(userId: string, postId: string, likeStatus: LikeStatusEnum): Promise<any> {
        return await  this.likesService.addReactionToPost(userId, postId, likeStatus)
    }

    async update(id: string, dto: UpdatePostDto): Promise<any> {
        try {
            await this.findPostById(id)
            await this.bloggersService.findById(dto.blogId)
            const result = await this.postsRepo.updatePost(id, dto)
            return result
        } catch (e) {
            if (e.name == 'NotFoundException') {
                throw new NotFoundException(e.message)
            } else if (e.name == 'CastError') {
                throw new NotFoundException('CastError, mf, give me real ObjectID')
            } else throw new BadRequestException(e)

        }

    }

}