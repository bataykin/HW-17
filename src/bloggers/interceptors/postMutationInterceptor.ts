import {
    BadGatewayException,
    CallHandler,
    ExecutionContext,
    ForbiddenException,
    Inject,
    Injectable,
    NestInterceptor, NotFoundException
} from "@nestjs/common";
import {catchError, map, Observable, tap, throwError} from "rxjs";
import {IBlogsRepo, IBlogsRepoToken} from "../IBlogsRepo";
import {BlogEntity} from "../entities/blogEntity";
import {IUsersRepo, IUsersRepoToken} from "../../users/IUsersRepo";
import {UserEntity} from "../../users/entity/user.entity";
import {AuthService} from "../../auth/authService";
import {IPostsRepo, IPostsRepoToken} from "../../posts/IPostsRepo";
import {PostEntity} from "../../posts/entities/post.entity";

@Injectable()
export class ChangePostByOtherUserInterceptor implements NestInterceptor {
    constructor(@Inject(IPostsRepoToken)
                private readonly postsRepo: IPostsRepo<PostEntity>,
                @Inject(IBlogsRepoToken)
                private readonly blogsRepo: IBlogsRepo<BlogEntity>,
                @Inject(IUsersRepoToken)
                private readonly usersRepo: IUsersRepo<UserEntity>,
                private readonly authService: AuthService) {
    }
    async intercept(context: ExecutionContext, next: CallHandler)/*: Observable<any>*/ {
       const httpContext = context.switchToHttp();
        const req = httpContext.getRequest();
        // const bodyDto = req.body.bodyDto;
        const blogId = req.params.blogId;
        const postId = req.params.postId;
        const accessToken = req.headers.authorization?.split(' ')[1]
        const retrievedUserFromToken =
            (accessToken) ? await this.authService.retrieveUser(accessToken) : undefined
        const userIdFromToken = (retrievedUserFromToken) ? retrievedUserFromToken.userId : undefined
        if (!blogId || !accessToken || !userIdFromToken)
            throw new NotFoundException('!blogId || !accessToken || !userIdFromToken')
        const blog = await this.blogsRepo.findBlogById(blogId)
        const post = await this.postsRepo.findPostById(postId)
        if (!post || !blog)
            throw new NotFoundException("net takogo blog or post ids")
        if (blog.userId !== userIdFromToken)
            throw new ForbiddenException('changing other blog is prohibited')


        return next
            .handle()
            // .pipe(
            //
            // )
            // .pipe(
            //     tap(() => console.log(`After... ${Date.now() - now}ms`)),
            // )
            // .pipe(
            //     catchError(err => throwError((e) => {
            //         new BadGatewayException('err from intercepro')
            //         }
            //     )),
            // )
            // .pipe(
            //     map((request) => {
            //         console.log(request)
            //         // this.blogsRepo.('Responded successfully');
            //         return request;
            //     })
            // );

    }
}