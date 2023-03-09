import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import {
  Inject,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { IPostsRepo, IPostsRepoToken } from "../../posts/DAL/IPostsRepo";
import { PostEntity } from "../../posts/entities/post.entity";
import { IBlogsRepo, IBlogsRepoToken } from "../DAL/IBlogsRepo";
import { BlogEntity } from "../entities/blogEntity";
import { UserEntity } from "../../users/entity/user.entity";
import { AuthService } from "../../auth/authService";
import {
  IUsersQueryRepo,
  IUsersQueryRepoToken,
} from "../../users/DAL/IUserQueryRepo";

export class DeletePostByBlogCommand {
  constructor(
    public readonly blogId: string,
    public readonly postId: string,
    public readonly accessToken: string,
  ) {}
}
@CommandHandler(DeletePostByBlogCommand)
export class DeletePostByBlogHandler
  implements ICommandHandler<DeletePostByBlogCommand>
{
  constructor(
    @Inject(IPostsRepoToken)
    private readonly postsRepo: IPostsRepo<PostEntity>,
    @Inject(IBlogsRepoToken)
    private readonly blogsRepo: IBlogsRepo<BlogEntity>,
    @Inject(IUsersQueryRepoToken)
    private readonly usersQueryRepo: IUsersQueryRepo<UserEntity>,
    private readonly authService: AuthService,
  ) {}
  async execute(command: DeletePostByBlogCommand): Promise<any> {
    const { postId, blogId, accessToken } = command;
    const retrievedUserFromToken = accessToken
      ? await this.authService.retrieveUser(accessToken)
      : undefined;
    const userIdFromToken = retrievedUserFromToken
      ? retrievedUserFromToken.userId
      : undefined;
    const isBanned = await this.usersQueryRepo.getBanStatus(userIdFromToken);
    if (isBanned) throw new UnauthorizedException("user is banned, sorry))");
    const post = await this.postsRepo.findPostById(postId);
    const blog = await this.blogsRepo.findBlogById(blogId);
    if (!post || !blog)
      throw new NotFoundException("net takogo blog or post ids");
    const result = await this.postsRepo.deletePost(postId);
  }
}
