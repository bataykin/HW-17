import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BadRequestException, Inject, NotFoundException } from "@nestjs/common";
import { IPostsRepo, IPostsRepoToken } from "../DAL/IPostsRepo";
import { PostEntity } from "../entities/post.entity";

export class RemovePostCommand {
  constructor(private readonly id: string) {}
}

@CommandHandler(RemovePostCommand)
export class RemovePostHandler implements ICommandHandler {
  constructor(
    @Inject(IPostsRepoToken)
    private readonly postsRepo: IPostsRepo<PostEntity>,
  ) {}
  async execute(command: any): Promise<any> {
    const { id } = command;
    try {
      const post = await this.postsRepo.findPostById(id);
      if (!post) {
        throw new NotFoundException("net takogo posta");
      }
    } catch (e) {
      if (e.name == "NotFoundException") {
        throw new NotFoundException("net takogo posta");
      } else throw new BadRequestException(e);
    }

    const result = await this.postsRepo.deletePost(id);
    return result;
  }
}
