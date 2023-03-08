import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {CreatePostDto} from '../dto/create-post.dto';
import {UpdatePostDto} from '../dto/update-post.dto';
import {PaginationPostsDto} from "../dto/pagination.posts.dto";
import {LikesEnum} from "../entities/likes.enum";
import {BloggersMongoRepo} from "../../bloggers/oldServicesRepos/bloggers.Mongo.repo";
import {PostsMongoRepo} from "./posts.Mongo.repo";
import {Error, MongooseError, UpdateQuery} from "mongoose";
import {Prop} from "@nestjs/mongoose";
import {LikeStatusEnum} from "../../comments/comment.schema";
import {CreatePostByBloggerDto} from "../../bloggers/dto/create.post.by.blogger.dto";
import {BloggersMongoService} from "../../bloggers/oldServicesRepos/bloggers.Mongo.service";
import {response} from "express";
import {BloggersSQLService} from "../../bloggers/oldServicesRepos/bloggers.SQL.service";
import {UsersMongoRepo} from "../../users/oldServiceRepos/users.Mongo.repo";
import {APostService} from "./IPostService";

@Injectable()
export class PostsMongoService implements APostService{
    constructor(protected readonly postsRepo: PostsMongoRepo,
                protected readonly usersRepo: UsersMongoRepo,
                protected readonly bloggersService: BloggersMongoService
    ) {
        // user - [post1, post2, post3]
        //post1 - totalLikes
        //post3 - totalLikes + 1
    }

    // from bloggers route
    async getPostsByBlogger(bloggerId: string, userId: string, PageNumber: number = 1, PageSize: number = 10) {
        const isUserInDb = await this.usersRepo.findOne({_id: userId})
        const skipSize = (PageNumber > 1) ? (PageSize * (PageNumber - 1)) : 0

        if (!isUserInDb) {
            userId = null
        }

        const posts = await this.postsRepo.getPostByBloggerId(bloggerId, userId, skipSize, PageSize)
        const mappedPost = posts.map((p) => {
            return {title: p.title, shortDescription: p.shortDescription, content: p.content, bloggerId: p.bloggerId}
        })
        const docCount = await this.postsRepo.countDocuments({bloggerId: bloggerId});
        const result = {
            "pagesCount": Math.ceil(docCount / PageSize),
            "page": PageNumber,
            "pageSize": PageSize,
            "totalCount": docCount,
            "items": posts
        }
        return result;

    }

    // from bloggers route
    async createPostByBlogger(blogId: string, {title, shortDescription, content}: CreatePostByBloggerDto) {
        const dto = {
            title, shortDescription, content, blogId
        }

        const isPostAlreadyExists = await this.postsRepo.isExists(dto)
        if (isPostAlreadyExists) {
            throw new BadRequestException('takoi post exists')
        }

        await this.bloggersService.findById(blogId)

        const bloggerName = await this.bloggersService.getBloggerNameById(blogId)
        const post = {
            id: undefined,
            title: title,
            shortDescription: shortDescription,
            content: content,
            bloggerId: blogId,
            bloggerName: bloggerName,
            addedAt: new Date(),
            extendedLikesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: LikeStatusEnum.None,
                newestLikes: []
            }
        }
        // const newPost = await this.postsRepo.create(post)
        // const mappedPost = newPost.map((p) => {
        //     return {title: p.title, shortDescription: p.shortDescription, content: p.content, bloggerId: p.bloggerId}
        // })
        // post.id = newPost
        return 'post'

    }


    async create(dto: CreatePostDto) {
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
        // const newPost = await this.postsRepo.create(post)
        // console.log(newPost)
        //
        // const mappedPost = newPost.map((p) => {
        //     let {_id, ...rest} = p
        //     return {id: _id, ...rest}
        // })
        // let {_id, ...rest} = newPost[0]
        // post.id = newPost

        return 'post'
    }

    async findAll({pageNumber = 1, pageSize = 10}: PaginationPostsDto) {
        const skipSize = (pageNumber > 1) ? (pageSize * (pageNumber - 1)) : 0
        const posts = await this.postsRepo.getAllPosts(skipSize, pageSize)
        const mappedPosts = posts.map((b) => {
            return {id: b.id,}
        })
        const docCount = await this.postsRepo.countDocuments({});
        const result = {
            "pagesCount": Math.ceil(docCount / pageSize),
            "page": pageNumber,
            "pageSize": pageSize,
            "totalCount": docCount,
            "items": posts
        }
        return result;
    }

    async findPostById(id: string) {
        try {
            const post = await this.postsRepo.findById(id)
            if (!post) {
                throw new NotFoundException('net takogo posta')
            }
            return post
        } catch (e: any) {
            if (e.name == 'NotFoundException') {
                throw new NotFoundException('net takogo posta')
            } else if (e.name == 'CastError') {
                throw new NotFoundException('CastError, mf, give me real ObjectID')
            } else throw new NotFoundException(e.message)
        }
    }

    async update(id: string, dto: UpdatePostDto) {
        try {
            const post = await this.postsRepo.findById(id)
            if (!post) {
                throw new NotFoundException()
            }
        } catch (e) {
            if (e.name == 'NotFoundException') {
                throw new NotFoundException('net takogo posta')
            } else if (e.name == 'CastError') {
                throw new NotFoundException('CastError, mf, give me real ObjectID')
            } else throw new BadRequestException(e)

        }

        const result = await this.postsRepo.updatePost(id, dto)
        return result
    }

    async remove(id: string) {
        try {
            const post = await this.postsRepo.findById(id)
            if (!post) {
                throw new NotFoundException('net takogo posta')
            }
        } catch (e) {
            throw new BadRequestException(e)
        }

        const result = await this.postsRepo.deletePost(id)
        return result
    }

    async setLikeStatus(userId: string, postId: string, likeStatus: LikeStatusEnum) {


        // if (!(likeStatus in LikeStatusEnum)) {
        //     throw new BadRequestException('likeStatus wrong')
        // }

        // (WRITE) - Create/Update 'reactedPosts' subrecord  about like reaction in acting user USERModel by userId and PostId
        const reactedUser = await this.usersRepo.setNewPostReaction(userId, postId, likeStatus)

        // (READ) - Return aggregated info from all users about this postId,
        // to collect counts of likes, dislikes and last 3 likes push to newestLikes array
        const totalLikes = await this.usersRepo.getTotalLikesOnPost(postId)
        const totalDislikes = await this.usersRepo.getTotalDislikesOnPost(postId)
        const last3Likes = await this.usersRepo.getLastLikes(postId)

        const updatedPost = await this.postsRepo.updatePostWithLike(postId, totalLikes, totalDislikes, last3Likes, likeStatus)
        // console.log(last3Likes)


        return updatedPost

    }

    async findPostByIdOnUserId(postId: string, userId: string) {
        const post = await this.postsRepo.findById(postId)
        if (!post) {
            throw new BadRequestException('postId net takogo posta')
        }
        // console.log(post)
        const UserReactionOnPost = await this.usersRepo.getUsersReactionOnPost(postId, userId)
        if (UserReactionOnPost) {
            post.extendedLikesInfo.myStatus = UserReactionOnPost
            return post
        }
        return post
    }


    async findAllAuthenticated(userId: string, {pageNumber = 1, pageSize = 10}: PaginationPostsDto) {
        const skipSize = (pageNumber > 1) ? (pageSize * (pageNumber - 1)) : 0
        const posts = await this.postsRepo.getAllPostsByAuthUser(userId, skipSize, pageSize)

        const docCount = await this.postsRepo.countDocuments({});
        const result = {
            "pagesCount": Math.ceil(docCount / pageSize),
            "page": pageNumber,
            "pageSize": pageSize,
            "totalCount": docCount,
            "items": posts
        }
        return result;
    }
}
