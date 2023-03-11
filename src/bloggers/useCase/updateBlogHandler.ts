import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import {
  ForbiddenException,
  Inject,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { UpdateBlogDto } from "../dto/update-blog.dto";
import { IBlogsRepo, IBlogsRepoToken } from "../DAL/IBlogsRepo";
import { BlogEntity } from "../entities/blogEntity";
import { UserEntity } from "../../users/entity/user.entity";
import { AuthService } from "../../auth/authService";
import {
  IUsersQueryRepo,
  IUsersQueryRepoToken,
} from "../../users/DAL/IUserQueryRepo";

export class UpdateBlogCommand {
  constructor(
    public readonly blogId: string,
    public readonly dto: UpdateBlogDto,
    public readonly accessToken: string,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogHandler implements ICommandHandler<UpdateBlogCommand> {
  constructor(
    @Inject(IBlogsRepoToken)
    private readonly blogsRepo: IBlogsRepo<BlogEntity>,
    @Inject(IUsersQueryRepoToken)
    private readonly usersQueryRepo: IUsersQueryRepo<UserEntity>,
    private readonly authService: AuthService,
  ) {}

  async execute(command: UpdateBlogCommand): Promise<any> {
    const { blogId, dto, accessToken } = command;
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
    console.log(blog?.userId, userIdFromToken);
    if (blog?.userId !== userIdFromToken) {
      throw new ForbiddenException(
        "user try to update blog that doesn't belong to current user",
      );
    }
    await this.blogsRepo.updateBlog(blogId, dto);
    return;
  }
}
