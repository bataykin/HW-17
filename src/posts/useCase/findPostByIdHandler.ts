import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Inject, NotFoundException } from "@nestjs/common";
import { IPostsRepo, IPostsRepoToken } from "../DAL/IPostsRepo";
import { PostEntity } from "../entities/post.entity";
import { ILikesRepo, ILikesRepoToken } from "../../likes/ILikesRepo";
import { LikeEntity } from "../../likes/entities/like.entity";
import { AuthService } from "../../auth/authService";

export class FindPostByIdCommand {
  constructor(public readonly postId: string) {}
}

@QueryHandler(FindPostByIdCommand)
export class FindPostByIdHandler implements IQueryHandler<FindPostByIdCommand> {
  constructor(
    @Inject(IPostsRepoToken)
    private readonly postsRepo: IPostsRepo<PostEntity>,
    @Inject(ILikesRepoToken)
    private readonly likesRepo: ILikesRepo<LikeEntity>,
    private readonly authService: AuthService,
  ) {}

  async execute(query: FindPostByIdCommand): Promise<any> {
    const { postId } = query;
    const post = await this.postsRepo.findPostById(postId);
    if (!post) {
      throw new NotFoundException("net takogo posta");
    }
    const mappedPostWithLikes =
      await this.likesRepo.mapLikesToPostEntityToResponse(post);

    return mappedPostWithLikes;
  }
}
