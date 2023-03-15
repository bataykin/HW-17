import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject, NotFoundException } from "@nestjs/common";
import { IUsersRepo, IUsersRepoToken } from "../../users/DAL/IUsersRepo";
import { UserEntity } from "../../users/entity/user.entity";
import { IDevicesRepo, IDevicesRepoToken } from "../../device/IDevicesRepo";
import { DeviceEntity } from "../../device/entities/device.entity";
import {
  IUsersQueryRepo,
  IUsersQueryRepoToken,
} from "../../users/DAL/IUserQueryRepo";
import { BanBlogInputModel } from "../dto/BanBlogInputModel";
import { IBlogsRepo, IBlogsRepoToken } from "../../bloggers/DAL/IBlogsRepo";
import { BlogEntity } from "../../bloggers/entities/blogEntity";

export class SA_BanUnbanBlogCommand {
  constructor(
    public readonly dto: BanBlogInputModel,
    public readonly blogId: string,
  ) {}
}

@CommandHandler(SA_BanUnbanBlogCommand)
export class SA_BanUnbanBlogHandler
  implements ICommandHandler<SA_BanUnbanBlogCommand>
{
  constructor(
    @Inject(IBlogsRepoToken)
    private readonly blogsRepo: IBlogsRepo<BlogEntity>,
    @Inject(IUsersRepoToken)
    private readonly usersRepo: IUsersRepo<UserEntity>,
    @Inject(IUsersQueryRepoToken)
    private readonly usersQueryRepo: IUsersQueryRepo<UserEntity>,
    @Inject(IDevicesRepoToken)
    private readonly devRepo: IDevicesRepo<DeviceEntity>,
  ) {}

  async execute(command: SA_BanUnbanBlogCommand): Promise<any> {
    const { blogId, dto } = command;

    const isBlogIdExists = await this.blogsRepo.findBlogById(blogId);
    if (!isBlogIdExists) {
      throw new NotFoundException("net takogo blog id");
    }

    await this.blogsRepo.SA_SetBlogBanStatus(blogId, dto.isBanned);
    return;
  }
}
