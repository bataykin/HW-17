import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreatePostDto } from "../dto/create-post.dto";
import { BadRequestException, Inject, NotFoundException } from "@nestjs/common";
import { IPostsRepo, IPostsRepoToken } from "../DAL/IPostsRepo";
import { PostEntity } from "../entities/post.entity";
import { IBlogsRepo, IBlogsRepoToken } from "../../bloggers/DAL/IBlogsRepo";
import { BlogEntity } from "../../bloggers/entities/blogEntity";
import { LikeStatusEnum } from "../../likes/LikeStatusEnum";
import { PostViewModel } from "../dto/PostViewModel";

export class CreatePostCommand {
  constructor(public readonly dto: CreatePostDto) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostHandler implements ICommandHandler<CreatePostCommand> {
  constructor(
    @Inject(IPostsRepoToken)
    private readonly postsRepo: IPostsRepo<PostEntity>,
    @Inject(IBlogsRepoToken)
    private readonly blogsRepo: IBlogsRepo<BlogEntity>,
  ) {}

  async execute(command: CreatePostCommand): Promise<PostViewModel> {
    const { dto } = command;
    const isPostAlreadyExists = await this.postsRepo.isPostExists(dto);
    if (isPostAlreadyExists) {
      throw new BadRequestException("takoi post title and blogId exists");
    }

    const blog = await this.blogsRepo.findBlogById(dto.blogId);
    if (!blog) {
      throw new NotFoundException("net takogo blogId");
    }
    const blogName = await this.blogsRepo.getBlogNameById(dto.blogId);
    const post = await this.postsRepo.createPost(dto, blog);
    const res: PostViewModel = {
      ...post,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatusEnum.None,
        newestLikes: [],
      },
      images: await this.postsRepo.mapImagesToPost(post),
    };

    return Promise.resolve(res);
  }
}
