import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { IBlogsRepo, IBlogsRepoToken } from "../../bloggers/IBlogsRepo";
import { BlogEntity } from "../../bloggers/entities/blogEntity";

export class SA_BindBlogToUserCommand {
  constructor(public readonly id: string, public readonly userId: string) {}
}

@CommandHandler(SA_BindBlogToUserCommand)
export class BindBlogToUserHandler
  implements ICommandHandler<SA_BindBlogToUserCommand>
{
  constructor(
    @Inject(IBlogsRepoToken)
    private readonly blogsRepo: IBlogsRepo<BlogEntity>,
  ) {}
  async execute(command: SA_BindBlogToUserCommand): Promise<any> {
    const { userId, id } = command;
    // console.log('blogId is ', id, ' userId is ', userId)
    await this.blogsRepo.SA_bindBlogToUser(id, userId);
    return Promise.resolve('implement BindBlogToUserCommand');
  }
}
