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
import { AuthService } from "../../auth/authService";
import { UserEntity } from "../../users/entity/user.entity";
import {
  IUsersQueryRepo,
  IUsersQueryRepoToken,
} from "../../users/DAL/IUserQueryRepo";
import { CreatePostDto } from "../../posts/dto/create-post.dto";

export class CreatePostByBlogCommand {
  constructor(
    public readonly blogId: string,
    public readonly dto: CreatePostDto,
    public readonly accessToken: string,
  ) {}
}

@CommandHandler(CreatePostByBlogCommand)
export class CreatePostByBlogHandler
  implements ICommandHandler<CreatePostByBlogCommand>
{
  constructor(
    @Inject(IPostsRepoToken)
    private readonly postsRepo: IPostsRepo<PostEntity>,
    @Inject(IBlogsRepoToken)
    private readonly blogsRepo: IBlogsRepo<BlogEntity>,
    private readonly authService: AuthService,
    @Inject(IUsersQueryRepoToken)
    private readonly usersQueryRepo: IUsersQueryRepo<UserEntity>,
  ) {}

  async execute(command: CreatePostByBlogCommand): Promise<any> {
    const { dto, blogId, accessToken } = command;
    const retrievedUserFromToken = await this.authService.retrieveUser(
      accessToken,
    );
    const userIdFromToken = retrievedUserFromToken.userId;
    const isUserExist = await this.usersQueryRepo.findById(userIdFromToken);
    if (!isUserExist || isUserExist.isBanned) {
      throw new UnauthorizedException("unexpected user");
    }
    const blog = await this.blogsRepo.findBlogById(blogId);
    if (!blog) {
      throw new NotFoundException("net takogo blogId");
    }
    if (blog?.userId !== userIdFromToken) {
      throw new ForbiddenException(
        "user try to createpost in  blog that doesn't belong to current user",
      );
    }

    const post = await this.postsRepo.createPost(dto, blog);
    // const {createdAt, ...rest } = post
    const res = await this.postsRepo.mapPostToView(post);
    return res;
  }
}
