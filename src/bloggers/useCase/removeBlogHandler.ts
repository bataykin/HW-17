import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import {
  ForbiddenException,
  Inject,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { IBlogsRepo, IBlogsRepoToken } from "../DAL/IBlogsRepo";
import { BlogEntity } from "../entities/blogEntity";
import { IPostsRepo, IPostsRepoToken } from "../../posts/DAL/IPostsRepo";
import { PostEntity } from "../../posts/entities/post.entity";
import { UserEntity } from "../../users/entity/user.entity";
import { AuthService } from "../../auth/authService";
import {
  IUsersQueryRepo,
  IUsersQueryRepoToken,
} from "../../users/DAL/IUserQueryRepo";

export class RemoveBlogCommand {
  constructor(
    public readonly id: string,
    public readonly accessToken: string,
  ) {}
}

@CommandHandler(RemoveBlogCommand)
export class RemoveBlogHandler implements ICommandHandler<RemoveBlogCommand> {
  constructor(
    @Inject(IPostsRepoToken)
    private readonly postsRepo: IPostsRepo<PostEntity>,
    @Inject(IBlogsRepoToken)
    private readonly blogsRepo: IBlogsRepo<BlogEntity>,
    @Inject(IUsersQueryRepoToken)
    private readonly usersQueryRepo: IUsersQueryRepo<UserEntity>,
    private readonly authService: AuthService,
  ) {}

  async execute(command: RemoveBlogCommand): Promise<any> {
    const { id, accessToken } = command;
    const retrievedUserFromToken = await this.authService.retrieveUser(
      accessToken,
    );
    const userIdFromToken = retrievedUserFromToken.userId;
    const isUserExist = await this.usersQueryRepo.findById(userIdFromToken);
    if (!isUserExist || isUserExist.isBanned) {
      throw new UnauthorizedException("unexpected user");
    }
    const blog = await this.blogsRepo.findBlogById(id);
    if (!blog) {
      throw new NotFoundException("net takogo blogId");
    }
    if (blog?.userId !== userIdFromToken) {
      throw new ForbiddenException(
        "user try to update blog that doesn't belong to current user",
      );
    }
    await this.blogsRepo.deleteBlog(id);
    return;
  }
}
