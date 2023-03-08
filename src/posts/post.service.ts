import {BadRequestException, Inject, Injectable} from "@nestjs/common";
import {IPostsRepo, IPostsRepoToken} from "./IPostsRepo";
import {PostsController} from "./posts.controller";
import {PostEntity} from "./entities/post.entity";
import {CreatePostDto} from "./dto/create-post.dto";
import {IBlogsRepo, IBlogsRepoToken} from "../bloggers/IBlogsRepo";
import {BlogEntity} from "../bloggers/entities/blogEntity";
import {BlogService} from "../bloggers/blog.service";
import {PostDalDto} from "./dto/post.dal.dto";
import {PaginationPostsDto} from "./dto/pagination.posts.dto";
import {BlogPostService} from "../BlogPostModule/blog.post.service";

class PostDALDto {
}

@Injectable()
export class PostService {
    constructor(
        @Inject(IPostsRepoToken)
        private readonly postsRepo: IPostsRepo<PostEntity>,
        private readonly blogService: BlogService
    ) {
    }


    async createPost(dto: CreatePostDto) {
        const isPostAlreadyExists = await this.postsRepo.isPostExists(dto)
        if (isPostAlreadyExists) {
            throw new BadRequestException('takoi post title and blogId exists')
        }
        // await this.blogService.findBlogById(dto.blogId)
        const blogName = await this.blogService.getBlogNameById(dto.blogId)
        const dalDto : PostDalDto = {...dto, blogName}
        const post = await this.postsRepo.createPost(dalDto)
        return post
    //     {
    //         title: 'newPost.title',
    //         shortDescription: 'newPost.shortDescription',
    //         content: 'newPost.content',
    //         bloggerId: 'newPost.bloggerId'}
    // }
    }

    async getAllPosts(paginationDto: PaginationPostsDto) {
        const {
            pageNumber = 1,
            pageSize = 10,
            sortBy = 'createdAt',
            sortDirection = 'desc',
            skipSize = (+pageNumber > 1) ? (+pageSize * (+pageNumber - 1)) : 0
        }
            = paginationDto
        const postsPaginationBLLdto = {
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            skipSize
        }
        const posts = await this.postsRepo.getPostsPaginated(postsPaginationBLLdto)
        const docCount = await this.postsRepo.countPosts()
        const result = {
            "pagesCount": Math.ceil(docCount / +pageSize),
            "page": +pageNumber,
            "pageSize": +pageSize,
            "totalCount": docCount,
            "items": posts
        }
        return result
    }

    async getPostsByBlogger(bloggerId: string, userId: string, PageNumber: number = 1, PageSize: number = 10) {
        // const isUserInDb = await this.usersRepo.findById( userId)
        // const skipSize = (PageNumber > 1) ? (PageSize * (PageNumber - 1)) : 0
        //
        // if (!isUserInDb) {
        //     userId = null
        // }
        //
        // const posts = await this.postsRepo.getPostByBloggerId(bloggerId, userId, skipSize, PageSize)
        // const mappedPost = posts.map((p) => {
        //     return {title: p.title, shortDescription: p.shortDescription, content: p.content, bloggerId: p.bloggerId}
        // })
        // // const docCount = await this.postsRepo.countDocuments({bloggerId: bloggerId});
        // const docCount = await this.postsRepo.countPosts();
        // const result = {
        //     "pagesCount": Math.ceil(docCount[0].total / PageSize),
        //     "page": PageNumber,
        //     "pageSize": PageSize,
        //     "totalCount": docCount[0].total,
        //     "items": posts
        // }
        // return result;
}}