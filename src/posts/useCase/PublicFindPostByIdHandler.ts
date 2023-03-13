import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Inject, NotFoundException } from "@nestjs/common";
import { IPostsRepo, IPostsRepoToken } from "../DAL/IPostsRepo";
import { PostEntity } from "../entities/post.entity";
import { ILikesRepo, ILikesRepoToken } from "../../likes/DAL/ILikesRepo";
import { LikeEntity } from "../../likes/entities/like.entity";
import { PostViewModel } from "../dto/PostViewModel";
import {
  IUsersQueryRepo,
  IUsersQueryRepoToken,
} from "../../users/DAL/IUserQueryRepo";
import { UserEntity } from "../../users/entity/user.entity";
import { JwtService } from "@nestjs/jwt";
import { jwtConstants } from "../../auth/constants";

export class PublicFindPostByIdQuery {
  constructor(
    public readonly postId: string,
    public readonly accessToken: string,
  ) {}
}

@QueryHandler(PublicFindPostByIdQuery)
export class PublicFindPostByIdHandler
  implements IQueryHandler<PublicFindPostByIdQuery>
{
  constructor(
    @Inject(IPostsRepoToken)
    private readonly postsRepo: IPostsRepo<PostEntity>,
    @Inject(ILikesRepoToken)
    private readonly likesRepo: ILikesRepo<LikeEntity>,
    @Inject(IUsersQueryRepoToken)
    private readonly usersQueryRepo: IUsersQueryRepo<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async execute(query: PublicFindPostByIdQuery): Promise<PostViewModel> {
    const { postId, accessToken } = query;
    const post = await this.postsRepo.findPostByIdPublic(postId);
    if (!post) {
      throw new NotFoundException("net takogo posta");
    }
    const retrievedUserFromToken = accessToken
      ? await this.jwtService.verify(accessToken, {
          secret: jwtConstants.secret,
        })
      : null;
    const userIdFromToken = retrievedUserFromToken
      ? await this.usersQueryRepo.findById(retrievedUserFromToken.userId)
      : null;
    const mappedPostWithLikes: PostViewModel =
      await this.postsRepo.mapPostToView(post, userIdFromToken);

    return mappedPostWithLikes;
  }
}
