import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdatePostByBlogDto } from "../dto/UpdatePostByBlogDto";
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
import { IUsersRepo, IUsersRepoToken } from "../../users/DAL/IUsersRepo";
import { UserEntity } from "../../users/entity/user.entity";
import { AuthService } from "../../auth/authService";
import {
  IUsersQueryRepo,
  IUsersQueryRepoToken,
} from "../../users/DAL/IUserQueryRepo";

export class UpdatePostByBlogCommand {
  constructor(
    public readonly blogId: string,
    public readonly postId: string,
    public readonly dto: UpdatePostByBlogDto,
    public readonly accessToken: string,
  ) {}
}

@CommandHandler(UpdatePostByBlogCommand)
export class UpdatePostByBlogHandler
  implements ICommandHandler<UpdatePostByBlogCommand>
{
  constructor(
    @Inject(IPostsRepoToken)
    private readonly postsRepo: IPostsRepo<PostEntity>,
    @Inject(IBlogsRepoToken)
    private readonly blogsRepo: IBlogsRepo<BlogEntity>,
    @Inject(IUsersRepoToken)
    private readonly usersRepo: IUsersRepo<UserEntity>,
    @Inject(IUsersQueryRepoToken)
    private readonly usersQueryRepo: IUsersQueryRepo<UserEntity>,
    private readonly authService: AuthService,
  ) {}

  async execute(command: UpdatePostByBlogCommand): Promise<any> {
    const { blogId, postId, dto, accessToken } = command;
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
    if (blog.userId !== userIdFromToken)
      throw new ForbiddenException("changing other blog is prohibited");

    // if (dto.blogId !== blogId) throw  new BadRequestException('blogId misfit')
    const extDto = { ...dto, blogId };
    const result = await this.postsRepo.updatePost(postId, extDto);
    return result;
  }
}
