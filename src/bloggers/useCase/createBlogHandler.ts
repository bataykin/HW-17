import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateBloggerDto } from "../dto/create.blogger.dto";
import { Inject, UnauthorizedException } from "@nestjs/common";
import { IBlogsRepo, IBlogsRepoToken } from "../IBlogsRepo";
import { BlogEntity } from "../entities/blogEntity";
import { UserEntity } from "../../users/entity/user.entity";
import { AuthService } from "../../auth/authService";
import { IUsersRepo, IUsersRepoToken } from "../../users/IUsersRepo";

export class CreateBlogCommand {
  constructor(
    public readonly dto: CreateBloggerDto,
    public readonly accessToken: string,
  ) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogHandler implements ICommandHandler<CreateBlogCommand> {
  constructor(
    @Inject(IBlogsRepoToken)
    private readonly blogsRepo: IBlogsRepo<BlogEntity>,
    @Inject(IUsersRepoToken)
    private readonly usersRepo: IUsersRepo<UserEntity>,
    private readonly authService: AuthService,
  ) {}

  async execute(command: CreateBlogCommand): Promise<any> {
    const { dto, accessToken } = command;
    const retrievedUserFromToken = await this.authService.retrieveUser(
      accessToken,
    );
    const userIdFromToken = retrievedUserFromToken.userId;
    const isUserExist = await this.usersRepo.findById(userIdFromToken);
    if (!isUserExist) {
      throw new UnauthorizedException('unexpected user');
    }
    const isUserBanned = await this.usersRepo.getBanStatus(userIdFromToken);
    if (isUserBanned)
      throw new UnauthorizedException('user is banned, sorry))');

    // const isExists = await this.blogsRepo.isBlogExistsByName(command.dto)
    // if (isExists) {
    //     throw new BadRequestException('Takoi blog name exists')
    // }

    const blog = await this.blogsRepo.createBlog(dto, userIdFromToken);
    const { /*createdAt,*/ userId, isBanned, banDate, ...rest } = blog;
    return rest;
  }
}
