import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PostsSQLRepo } from "./posts.SQL.repo";
import { BloggersSQLService } from "../../bloggers/DAL/bloggers.SQL.service";
import { CreatePostByBloggerDto } from "../../bloggers/dto/create.post.by.blogger.dto";
import { LikeStatusEnum } from "../../likes/LikeStatusEnum";
import { CreatePostDto } from "../dto/create-post.dto";
import { PaginationPostsDto } from "../dto/pagination.posts.dto";
import { UpdatePostDto } from "../dto/update-post.dto";
import { LikesSQLService } from "../../likes/oldServiceRepos/likes.SQL.service";
import { APostService } from "./IPostService";
import {
  IUsersQueryRepo,
  IUsersQueryRepoToken,
} from "../../users/DAL/IUserQueryRepo";
import { UserEntity } from "../../users/entity/user.entity";

@Injectable()
export class PostsSQLService implements APostService {
  constructor(
    protected readonly postsRepo: PostsSQLRepo,
    @Inject(IUsersQueryRepoToken)
    private readonly usersQueryRepo: IUsersQueryRepo<UserEntity>,
    protected readonly bloggersService: BloggersSQLService,
    protected readonly likesService: LikesSQLService,
  ) {}

  // from bloggers route
  async getPostsByBlogger(
    bloggerId: string,
    userId: string,
    PageNumber = 1,
    PageSize = 10,
  ) {
    const isUserInDb = await this.usersQueryRepo.findById(userId);
    const skipSize = PageNumber > 1 ? PageSize * (PageNumber - 1) : 0;

    if (!isUserInDb) {
      userId = null;
    }

    const posts = await this.postsRepo.getPostByBloggerId(
      bloggerId,
      userId,
      skipSize,
      PageSize,
    );
    const mappedPost = posts.map((p) => {
      return {
        title: p.title,
        shortDescription: p.shortDescription,
        content: p.content,
        bloggerId: p.bloggerId,
      };
    });
    // const docCount = await this.postsRepo.countDocuments({bloggerId: bloggerId});
    const docCount = await this.postsRepo.countDocuments();
    const result = {
      pagesCount: Math.ceil(docCount[0].total / PageSize),
      page: PageNumber,
      pageSize: PageSize,
      totalCount: docCount[0].total,
      items: posts,
    };
    return result;
  }

  // from bloggers route
  async createPostByBlogger(
    blogId: string,
    { title, shortDescription, content }: CreatePostByBloggerDto,
  ) {
    const dto = {
      title,
      shortDescription,
      content,
      blogId,
    };

    const isPostAlreadyExists = await this.postsRepo.isExists(dto);
    if (isPostAlreadyExists.length > 0) {
      throw new BadRequestException("takoi post exists");
    }

    await this.bloggersService.findById(blogId);

    const bloggerName = await this.bloggersService.getBloggerNameById(blogId);

    const post = {
      id: undefined,
      title: title,
      shortDescription: shortDescription,
      content: content,
      blogId: blogId,
      bloggerName: bloggerName,
      addedAt: new Date(),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatusEnum.None,
        newestLikes: [],
      },
    };
    // const newPost = await this.postsRepo.create(post)
    // newPost[0].extendedLikesInfo = post.extendedLikesInfo

    return "newPost[0]";
  }

  async create(dto: CreatePostDto) {
    const isPostAlreadyExists = await this.postsRepo.isExists(dto);
    if (isPostAlreadyExists.length > 0) {
      throw new BadRequestException("takoi post exists");
    }
    const { title, shortDescription, content, blogId } = dto;

    await this.bloggersService.findById(blogId);

    const bloggerName = await this.bloggersService.getBloggerNameById(blogId);

    let post = {
      title: title,
      shortDescription: shortDescription,
      content: content,
      bloggerId: blogId,
      bloggerName: bloggerName,
      addedAt: new Date(),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: "None",
        newestLikes: [],
      },
      id: undefined,
    };
    // const newPost = await this.postsRepo.create(post)
    // newPost[0].extendedLikesInfo = post.extendedLikesInfo

    return "newPost[0]";
  }

  async findAll(
    { pageNumber = 1, pageSize = 10 }: PaginationPostsDto,
    userId?: string,
  ) {
    const skipSize = pageNumber > 1 ? pageSize * (pageNumber - 1) : 0;
    const posts = await this.postsRepo.getAllPosts(skipSize, pageSize);

    // TODO OPTIMIZE ALGORYTHM RETRIEVING REACTIONS ON POSTS better than O(n^2)

    for (const p of posts) {
      p.extendedLikesInfo = await this.likesService.getPostLikeInfo(
        userId,
        p.id,
      );
    }
    const docCount = await this.postsRepo.countDocuments();
    const result = {
      pagesCount: Math.ceil(docCount[0].total / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: docCount[0].total,
      items: posts,
    };
    return result;
  }

  async findPostById(id: string, userId?: string) {
    try {
      const post = await this.postsRepo.findById(id);
      if (post.length == 0) {
        throw new NotFoundException("net takogo posta");
      }
      post[0].extendedLikesInfo = await this.likesService.getPostLikeInfo(
        userId,
        id,
      );
      return post[0];
    } catch (e: any) {
      if (e.name == "NotFoundException") {
        throw new NotFoundException("net takogo posta");
      } else throw new NotFoundException(e.message);
    }
  }

  async update(id: string, dto: UpdatePostDto) {
    try {
      const post = await this.postsRepo.findById(id);
      if (!post) {
        throw new NotFoundException();
      }
    } catch (e) {
      if (e.name == "NotFoundException") {
        throw new NotFoundException("net takogo posta");
      } else if (e.name == "CastError") {
        throw new NotFoundException("CastError, mf, give me real ObjectID");
      } else throw new BadRequestException(e);
    }

    const result = await this.postsRepo.updatePost(id, dto);
    return result;
  }

  async remove(id: string) {
    try {
      const post = await this.postsRepo.findById(id);
      if (post.length == 0) {
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

  async setLikeStatus(
    userId: string,
    postId: string,
    likeStatus: LikeStatusEnum,
  ) {
    // (WRITE) - Create/Update 'reactedPosts' subrecord  about like reaction in acting user USERModel by userId and PostId

    const reaction = await this.likesService.addReactionToPost(
      userId,
      postId,
      likeStatus,
    );

    // (READ) - Return aggregated info from all users about this postId,
    // to collect counts of likes, dislikes and last 3 likes push to newestLikes array

    return reaction;
  }

  async findPostByIdOnUserId(postId: string, userId: string) {
    const post = await this.postsRepo.findById(postId);
    if (!post) {
      throw new BadRequestException("postId net takogo posta");
    }
    // console.log(post)
    // TODO check solution, it was fast fixing
    const UserReactionOnPost = await this.likesService.getPostLikeInfo(
      userId,
      postId,
    );
    if (UserReactionOnPost) {
      post.extendedLikesInfo.myStatus = UserReactionOnPost;
      return post;
    }
    return post;
  }

  // async findAllAuthenticated(userId: string, {PageNumber = 1, PageSize = 10}: PaginationPostsDto) {
  //     const skipSize = (PageNumber > 1) ? (PageSize * (PageNumber - 1)) : 0
  //     const posts = await this.postsRepo.getAllPostsByAuthUser(userId, skipSize, PageSize)
  //
  //     const docCount = await this.postsRepo.countDocuments();
  //     const result = {
  //         "pagesCount": Math.ceil(docCount[0].total / PageSize),
  //         "page": PageNumber,
  //         "pageSize": PageSize,
  //         "totalCount": docCount[0].total,
  //         "items": posts
  //     }
  //     return result;
  // }
}
