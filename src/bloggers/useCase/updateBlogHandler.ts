import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import exp from "constants";
import {Body, ForbiddenException, Inject, NotFoundException, UnauthorizedException} from "@nestjs/common";
import {UpdateBlogDto} from "../dto/update-blog.dto";
import {IBlogsRepo, IBlogsRepoToken} from "../IBlogsRepo";
import {BlogEntity} from "../entities/blogEntity";
import {IPostsRepo, IPostsRepoToken} from "../../posts/IPostsRepo";
import {PostEntity} from "../../posts/entities/post.entity";
import {IUsersRepo, IUsersRepoToken} from "../../users/IUsersRepo";
import {UserEntity} from "../../users/entity/user.entity";
import {AuthService} from "../../auth/authService";

export class UpdateBlogCommand {
    constructor(public readonly id: string,
                public readonly dto: UpdateBlogDto,
                public readonly accessToken: string) {
    }
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogHandler implements ICommandHandler<UpdateBlogCommand> {
    constructor(@Inject(IPostsRepoToken)
                private readonly postsRepo: IPostsRepo<PostEntity>,
                @Inject(IBlogsRepoToken)
                private readonly blogsRepo: IBlogsRepo<BlogEntity>,
                @Inject(IUsersRepoToken)
                private readonly usersRepo: IUsersRepo<UserEntity>,
                private readonly authService: AuthService) {
    }

    async execute(command: UpdateBlogCommand): Promise<any> {
        const {id, dto, accessToken} = command
        const retrievedUserFromToken =
            (accessToken) ? await this.authService.retrieveUser(accessToken) : undefined
        const userIdFromToken = (retrievedUserFromToken) ? retrievedUserFromToken.userId : undefined
        const isBanned = await this.usersRepo.getBanStatus(userIdFromToken)
        if (isBanned) throw new UnauthorizedException('user is banned, sorry))')
        const blog = await this.blogsRepo.findBlogById(id)
        if (!blog) throw new NotFoundException('net takogo blog id')
        if (blog.userId !== userIdFromToken) throw new ForbiddenException('changing other blog is prohibited')
        await this.blogsRepo.updateBlog(id, dto)
        return blog
    }

}