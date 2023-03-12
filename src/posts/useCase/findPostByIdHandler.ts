import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Inject, NotFoundException } from "@nestjs/common";
import { IPostsRepo, IPostsRepoToken } from "../DAL/IPostsRepo";
import { PostEntity } from "../entities/post.entity";
import { ILikesRepo, ILikesRepoToken } from "../../likes/DAL/ILikesRepo";
import { LikeEntity } from "../../likes/entities/like.entity";
import { PostViewModel } from "../dto/PostViewModel";

export class PublicFindPostByIdQuery {
  constructor(public readonly postId: string) {}
}

@QueryHandler(PublicFindPostByIdQuery)
export class FindPostByIdHandler
  implements IQueryHandler<PublicFindPostByIdQuery>
{
  constructor(
    @Inject(IPostsRepoToken)
    private readonly postsRepo: IPostsRepo<PostEntity>,
    @Inject(ILikesRepoToken)
    private readonly likesRepo: ILikesRepo<LikeEntity>,
  ) {}

  async execute(query: PublicFindPostByIdQuery): Promise<PostViewModel> {
    const { postId } = query;
    const post = await this.postsRepo.findPostByIdPublic(postId);
    if (!post) {
      throw new NotFoundException("net takogo posta");
    }
    const mappedPostWithLikes = await this.postsRepo.mapPostToView(post);

    return mappedPostWithLikes;
  }
}
