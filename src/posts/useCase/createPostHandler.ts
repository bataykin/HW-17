import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreatePostDto } from "../dto/create-post.dto";
import { BadRequestException, Inject, NotFoundException } from "@nestjs/common";
import { IPostsRepo, IPostsRepoToken } from "../IPostsRepo";
import { PostEntity } from "../entities/post.entity";
import { PostDalDto } from "../dto/post.dal.dto";
import { LikeStatusEnum } from "../../comments/comment.schema";
import { IBlogsRepo, IBlogsRepoToken } from "../../bloggers/IBlogsRepo";
import { BlogEntity } from "../../bloggers/entities/blogEntity";
import { isUUID } from "class-validator";

export class CreatePostCommand {
    constructor(
        public readonly dto: CreatePostDto
    ) {
    }

}

@CommandHandler(CreatePostCommand)
export class CreatePostHandler implements ICommandHandler<CreatePostCommand> {
    constructor(@Inject(IPostsRepoToken)
                private readonly postsRepo: IPostsRepo<PostEntity>,
                @Inject(IBlogsRepoToken)
                private readonly blogsRepo: IBlogsRepo<BlogEntity>,) {
    }

    async execute(command: CreatePostCommand): Promise<any> {
        const {dto} = command
        const isPostAlreadyExists = await this.postsRepo.isPostExists(dto)
        if (isPostAlreadyExists) {
            throw new BadRequestException('takoi post title and blogId exists')
        }
        if (!isUUID(dto.blogId))
        {
            throw new NotFoundException('blogId have weird uuid')
        }
        const blog = await this.blogsRepo.findBlogById(dto.blogId)
        if (!blog){
            throw new NotFoundException('net takogo blogId')
        }
        const blogName = await this.blogsRepo.getBlogNameById(dto.blogId)
        const dalDto : PostDalDto = {...dto, blogName}
        const post = await this.postsRepo.createPost(dalDto)
        const res = {
            ...post,
            extendedLikesInfo:{
                likesCount: 0,
                dislikesCount: 0,
                myStatus: LikeStatusEnum.None,
                newestLikes:[]
            }
        }

        return Promise.resolve(res);
    }

}