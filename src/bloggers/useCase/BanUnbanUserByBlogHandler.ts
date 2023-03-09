import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BanUserByBlogDto } from "../dto/banUserByBlogDto";
import {
  ForbiddenException,
  Inject,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { UserEntity } from "../../users/entity/user.entity";
import { IBlogsRepo, IBlogsRepoToken } from "../DAL/IBlogsRepo";
import { BlogEntity } from "../entities/blogEntity";
import { AuthService } from "../../auth/authService";
import { BannedUsersEntity } from "../entities/bannedUsersEntity";
import {
  IBannedUsersRepo,
  IBannedUsersRepoToken,
} from "../DAL/IBannedUsersRepo";
import {
  IUsersQueryRepo,
  IUsersQueryRepoToken,
} from "../../users/DAL/IUserQueryRepo";

export class BanUnbanUserByBloggerCommand {
  constructor(
    public readonly userId: string,
    public readonly dto: BanUserByBlogDto,
    public readonly accessToken: string,
  ) {}
}

@CommandHandler(BanUnbanUserByBloggerCommand)
export class BanUnbanUserByBlogHandler
  implements ICommandHandler<BanUnbanUserByBloggerCommand>
{
  constructor(
    private readonly authService: AuthService,
    @Inject(IUsersQueryRepoToken)
    private readonly usersQueryRepo: IUsersQueryRepo<UserEntity>,
    @Inject(IBlogsRepoToken)
    private readonly blogsRepo: IBlogsRepo<BlogEntity>,
    @Inject(IBannedUsersRepoToken)
    private readonly bannedUsersRepo: IBannedUsersRepo<BannedUsersEntity>,
  ) {}
  async execute(command: BanUnbanUserByBloggerCommand): Promise<any> {
    const { userId, dto, accessToken } = command;
    const retrievedUserFromToken = await this.authService.retrieveUser(
      accessToken,
    );
    const userIdFromToken = retrievedUserFromToken.userId;
    const isUserExist = await this.usersQueryRepo.findById(userIdFromToken);
    if (!isUserExist) {
      throw new UnauthorizedException("unexpected user");
    }
    const user = await this.usersQueryRepo.findById(userId);
    if (!user) {
      throw new NotFoundException(`userId ${userId} not found`);
    }
    const blog = await this.blogsRepo.findBlogById(dto.blogId);
    const blogOwnerId = blog.userId;
    if (userIdFromToken !== blogOwnerId) {
      throw new ForbiddenException(
        "try to update or delete the entity that was created by another user",
      );
    }
    await this.bannedUsersRepo.setBanStatus(userId, dto);
    return Promise.resolve(undefined);
  }
}
