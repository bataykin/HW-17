import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateBlogDto } from "../dto/createBlogDto";
import { Inject, UnauthorizedException } from "@nestjs/common";
import { IBlogsRepo, IBlogsRepoToken } from "../DAL/IBlogsRepo";
import { BlogEntity } from "../entities/blogEntity";
import { UserEntity } from "../../users/entity/user.entity";
import { AuthService } from "../../auth/authService";
import {
  IUsersQueryRepo,
  IUsersQueryRepoToken,
} from "../../users/DAL/IUserQueryRepo";
import { BlogViewModel } from "../dto/BlogViewModel";

export class CreateBlogCommand {
  constructor(
    public readonly dto: CreateBlogDto,
    public readonly accessToken: string,
  ) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogHandler implements ICommandHandler<CreateBlogCommand> {
  constructor(
    @Inject(IBlogsRepoToken)
    private readonly blogsRepo: IBlogsRepo<BlogEntity>,
    @Inject(IUsersQueryRepoToken)
    private readonly usersQueryRepo: IUsersQueryRepo<UserEntity>,
    private readonly authService: AuthService,
  ) {}

  async execute(command: CreateBlogCommand): Promise<BlogViewModel> {
    const { dto, accessToken } = command;
    const retrievedUserFromToken = await this.authService.retrieveUser(
      accessToken,
    );
    const userIdFromToken = retrievedUserFromToken.userId;
    const isUserExist = await this.usersQueryRepo.findById(userIdFromToken);
    if (!isUserExist || isUserExist.isBanned) {
      throw new UnauthorizedException("unexpected user");
    }

    // const isExists = await this.blogsRepo.isBlogExistsByName(command.dto)
    // if (isExists) {
    //     throw new BadRequestException('Takoi blog name exists')
    // }

    const blog = await this.blogsRepo.createBlog(dto, userIdFromToken);
    const mappedBlog = await this.blogsRepo.mapBlogToResponse(blog);
    return mappedBlog;
  }
}
