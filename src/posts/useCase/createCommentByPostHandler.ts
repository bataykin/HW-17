import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import {
  ForbiddenException,
  Inject,
  UnauthorizedException,
} from "@nestjs/common";
import {
  ICommentsRepo,
  ICommentsRepoToken,
} from "../../comments/DAL/ICommentsRepo";
import { CommentEntity } from "../../comments/entities/comment.entity";
import { AuthService } from "../../auth/authService";
import { IUsersRepo, IUsersRepoToken } from "../../users/DAL/IUsersRepo";
import { UserEntity } from "../../users/entity/user.entity";
import { IBlogsRepo, IBlogsRepoToken } from "../../bloggers/DAL/IBlogsRepo";
import { BlogEntity } from "../../bloggers/entities/blogEntity";
import {
  IBannedUsersRepo,
  IBannedUsersRepoToken,
} from "../../bloggers/DAL/IBannedUsersRepo";
import { BannedUsersEntity } from "../../bloggers/entities/bannedUsersEntity";
import { IPostsRepo, IPostsRepoToken } from "../DAL/IPostsRepo";
import { PostEntity } from "../entities/post.entity";
import {
  IUsersQueryRepo,
  IUsersQueryRepoToken,
} from "../../users/DAL/IUserQueryRepo";
import { CommentViewPublicDTO } from "../../comments/dto/CommentViewPublicDTO";
import { CommentToRepoDTO } from "../../comments/dto/CommentToRepoDTO";
import { LikeStatusEnum } from "../../likes/LikeStatusEnum";

export class CreateCommentByPostCommand {
  constructor(
    public readonly postId: string,
    public readonly content: string,
    public readonly accessToken: string,
  ) {}
}

@CommandHandler(CreateCommentByPostCommand)
export class CreateCommentByPostHandler
  implements ICommandHandler<CreateCommentByPostCommand>
{
  constructor(
    private readonly authService: AuthService,
    @Inject(ICommentsRepoToken)
    private readonly commentsRepo: ICommentsRepo<CommentEntity>,
    @Inject(IUsersRepoToken)
    private readonly usersRepo: IUsersRepo<UserEntity>,
    @Inject(IUsersQueryRepoToken)
    private readonly usersQueryRepo: IUsersQueryRepo<UserEntity>,
    @Inject(IBlogsRepoToken)
    private readonly blogsRepo: IBlogsRepo<BlogEntity>,
    @Inject(IPostsRepoToken)
    private readonly postsRepo: IPostsRepo<PostEntity>,
    @Inject(IBannedUsersRepoToken)
    private readonly bannedUsersRepo: IBannedUsersRepo<BannedUsersEntity>,
  ) {}
  async execute(
    command: CreateCommentByPostCommand,
  ): Promise<CommentViewPublicDTO> {
    const { content, accessToken, postId } = command;
    const retrievedUserFromToken = await this.authService.retrieveUser(
      accessToken,
    );
    const userIdFromToken = retrievedUserFromToken.userId;
    const isUserExist = await this.usersQueryRepo.findById(userIdFromToken);
    if (!isUserExist) {
      throw new UnauthorizedException("unexpected user");
    }
    const isBanned = await this.usersQueryRepo.getBanStatus(userIdFromToken);
    if (isBanned) throw new UnauthorizedException("user is banned, sorry))");

    const post = await this.postsRepo.findPostById(postId);
    const blog = await this.blogsRepo.findBlogById(post.blogId);
    const bannedAtBlog = await this.bannedUsersRepo.getBannedUserByIdAtBlog(
      userIdFromToken,
      blog.id,
    );
    if (bannedAtBlog) {
      throw new ForbiddenException(
        "banned user by blogger cant comment posts of current blog",
      );
    }
    const commentDraft: CommentToRepoDTO = {
      content: content,
      userId: retrievedUserFromToken.userId,
      userLogin: retrievedUserFromToken.username,
      postId: postId,
    };
    const createdComment = await this.commentsRepo.createComment(commentDraft);
    const res: CommentViewPublicDTO = {
      id: createdComment.id,
      content: createdComment.content,
      commentatorInfo: {
        userId: commentDraft.userId,
        userLogin: commentDraft.userLogin,
      },
      createdAt: createdComment.createdAt,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatusEnum.None,
      },
    };

    return res;
  }
}
