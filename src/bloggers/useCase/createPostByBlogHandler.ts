import { CreatePostByBloggerDto } from "../dto/create.post.by.blogger.dto";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  NotFoundException,
  UnauthorizedException
} from "@nestjs/common";
import { PostDalDto } from "../../posts/dto/post.dal.dto";
import { IPostsRepo, IPostsRepoToken } from "../../posts/IPostsRepo";
import { PostEntity } from "../../posts/entities/post.entity";
import { IBlogsRepo, IBlogsRepoToken } from "../IBlogsRepo";
import { BlogEntity } from "../entities/blogEntity";
import { LikeStatusEnum } from "../../comments/comment.schema";
import { AuthService } from "../../auth/authService";
import { IUsersRepo, IUsersRepoToken } from "../../users/IUsersRepo";
import { UserEntity } from "../../users/entity/user.entity";

export class CreatePostByBlogCommand {
    constructor(public readonly blogId: string,
                public readonly dto: CreatePostByBloggerDto,
                public readonly accessToken: string,) {
    }
}

@CommandHandler(CreatePostByBlogCommand)
export class CreatePostByBlogHandler implements ICommandHandler<CreatePostByBlogCommand> {
    constructor(@Inject(IPostsRepoToken)
                private readonly postsRepo: IPostsRepo<PostEntity>,
                @Inject(IBlogsRepoToken)
                private readonly blogsRepo: IBlogsRepo<BlogEntity>,
                private readonly authService: AuthService,
                @Inject(IUsersRepoToken)
                private readonly usersRepo: IUsersRepo<UserEntity>,) {
    }

    async execute(command: CreatePostByBlogCommand): Promise<any> {
        const {dto, blogId,accessToken} = command
        const retrievedUserFromToken =
            (accessToken) ? await this.authService.retrieveUser(accessToken) : undefined
        const userIdFromToken = (retrievedUserFromToken) ? retrievedUserFromToken.userId : undefined
        const isBanned = await this.usersRepo.getBanStatus(userIdFromToken)
        if (isBanned) throw new UnauthorizedException('user is banned, sorry))')
        const mixDto = {...dto, blogId}
        const isPostAlreadyExists = await this.postsRepo.isPostExists(mixDto)
        if (isPostAlreadyExists) {
            throw new BadRequestException('takoi post title and blogId exists')
        }
        const blog = await this.blogsRepo.findBlogById(blogId)
        if (!blog) {
            throw new NotFoundException('net takogo blogId')
        }
        if (blog.userId !== userIdFromToken)
            throw new ForbiddenException('changing other blog is prohibited')

        const blogName22 = await this.blogsRepo.getBlogNameById(blogId)
        const dalDto: PostDalDto = {...dto, blogId, blogName: blogName22}
        const post = await this.postsRepo.createPost(dalDto)
        // const {createdAt, ...rest } = post
        const res = {
            ...post,
            extendedLikesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: LikeStatusEnum.None,
                newestLikes: []
            }
        }
        return Promise.resolve(res);
    }
}