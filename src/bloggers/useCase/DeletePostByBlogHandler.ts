import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import {
  ForbiddenException,
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

export class BloggerDeletePostByBlogCommand {
  constructor(
    public readonly blogId: string,
    public readonly postId: string,
    public readonly accessToken: string,
  ) {}
}
@CommandHandler(BloggerDeletePostByBlogCommand)
export class DeletePostByBlogHandler
  implements ICommandHandler<BloggerDeletePostByBlogCommand>
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
  async execute(command: BloggerDeletePostByBlogCommand): Promise<void> {
    const { postId, blogId, accessToken } = command;
    const retrievedUserFromToken = await this.authService.retrieveUser(
      accessToken,
    );
    const userIdFromToken = retrievedUserFromToken.userId;
    const isUserExist = await this.usersQueryRepo.findById(userIdFromToken);
    if (!isUserExist || isUserExist.isBanned) {
      throw new UnauthorizedException("unexpected user");
    }
    const blog = await this.blogsRepo.findBlogById(blogId);
    const post = await this.postsRepo.findPostById(postId);
    if (!blog || !post) {
      throw new NotFoundException("net takogo bloga ili posta");
    }
    if (blog?.userId !== userIdFromToken || post.blogId !== blogId) {
      throw new ForbiddenException(
        "user try to delete blog that doesn't belong to current user",
      );
    }
    await this.postsRepo.deletePost(postId);
  }
}
