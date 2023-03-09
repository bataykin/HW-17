import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject, NotFoundException } from "@nestjs/common";
import { UpdatePostDto } from "../dto/update-post.dto";
import { IPostsRepo, IPostsRepoToken } from "../DAL/IPostsRepo";
import { PostEntity } from "../entities/post.entity";
import { IBlogsRepo, IBlogsRepoToken } from "../../bloggers/DAL/IBlogsRepo";
import { BlogEntity } from "../../bloggers/entities/blogEntity";

export class UpdateBlogCommand {
  constructor(public readonly id: string, public readonly dto: UpdatePostDto) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdatePostHandler implements ICommandHandler<UpdateBlogCommand> {
  constructor(
    @Inject(IPostsRepoToken)
    private readonly postsRepo: IPostsRepo<PostEntity>,
    @Inject(IBlogsRepoToken)
    private readonly blogsRepo: IBlogsRepo<BlogEntity>,
  ) {}

  async execute(command: UpdateBlogCommand): Promise<any> {
    const { id, dto } = command;

    const post = await this.postsRepo.findPostById(id);
    const blog = await this.blogsRepo.findBlogById(dto.blogId);
    if (!post || !blog) {
      throw new NotFoundException("net takogo blog or post ids");
    }
    const result = await this.postsRepo.updatePost(id, dto);
    return result;
  }
}
