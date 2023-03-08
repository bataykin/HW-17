import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { CommentEntity } from "./entities/comment.entity";
import { ICommentsRepo } from "./ICommentsRepo";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { PaginationCommentsDto } from "./dto/paginationCommentsDto";
import { BlogsPaginationDto } from "../bloggers/dto/blogsPaginationDto";
import { CommentViewDtoForBlogger } from "./dto/commentViewDtoForBlogger";
import { LikeStatusEnum } from "../likes/LikeStatusEnum";

export class CommentsORM
  extends Repository<CommentEntity>
  implements ICommentsRepo<CommentEntity>
{
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentsRepo: Repository<CommentEntity>,
  ) {
    super(CommentEntity, commentsRepo.manager, commentsRepo.queryRunner);
  }

  async countAllCommentsForAllUserBlogs(userId: string) {
    const res = await this.commentsRepo
      .createQueryBuilder("coms")
      .leftJoinAndSelect("coms.post", "posts")
      .leftJoinAndSelect("posts.blogger", "blogs")
      .where("blogs.user=:userId", { userId })
      .getCount();
    return res;
  }

  async getAllCommentByBlog(
    userId: string,
    dto: BlogsPaginationDto,
  ): Promise<CommentEntity[]> {
    // console.log(
    //   'XXXXXXXXXXXXXXXXXXXXX - getAllCommentByBlog start query - XXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    // );
    let comments = await this.commentsRepo
      .createQueryBuilder("comments")
      .leftJoin("comments.post", "posts")
      .leftJoin("posts.blogger", "blogs")
      .where("blogs.userId = :userId", { userId })
      // .andWhere('users.isBanned = false')
      .skip(dto.skipSize)
      .take(dto.pageSize)
      .orderBy(
        "comments." + dto.sortBy,
        dto.sortDirection === "asc" ? "ASC" : "DESC",
        "NULLS LAST",
      )
      .getMany();
    // console.log(
    //   'YYYYYYYYYYYYYYYYYYYYY - getAllCommentByBlog end query - YYYYYYYYYYYYYYYYYYYYYYYYYYY',
    // );

    // console.log(comments);
    return comments;
  }

  async mapCommentsToResponse(allComments: CommentEntity[]) {
    const result = [];
    let res: CommentViewDtoForBlogger;
    for await (let comment of allComments) {
      let { id, content, createdAt, userId, userLogin, postId } = comment;

      const post = await this.createQueryBuilder("c")
        .leftJoinAndSelect("c.post", "p")
        .where("c.id =:commentId", { commentId: id })
        .getOne();

      res = {
        id: id,
        content: content,
        createdAt: createdAt,
        commentatorInfo: {
          userId: userId,
          userLogin: userLogin,
        },
        postInfo: {
          id: postId,
          title: post.post.title,
          blogId: post.post.blogId,
          blogName: post.post.blogName,
        },
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: LikeStatusEnum.None,
        },
      };
      result.push(res);

      // let likes = await this.manager
      //   .createQueryBuilder()
      //   .select()
      //   .from(LikeEntity, 'l')
      //   .leftJoin('users', 'u', 'l.userId = u.id')
      //   .addSelect(
      //     `
      //       COALESCE( SUM( CASE
      //               WHEN l.reaction = 'Dislike' THEN 1
      //               ELSE 0 END ), 0 )
      //       `,
      //     'dislikesCount',
      //   )
      //   .addSelect(
      //     `
      //       COALESCE( SUM( CASE
      //           WHEN l.reaction = 'Like' THEN 1
      //           ELSE 0 END ), 0)
      //       `,
      //     'likesCount',
      //   )
      //   .where('l.commentId = :commentId', { commentId: id })
      //   .andWhere('u.isBanned = false')
      //   .getRawOne();
      // res = likes;
    }
    return result;
  }

  async createComment(comment: CreateCommentDto) {
    const comm = new CommentEntity();
    comm.content = comment.content;
    comm.postId = comment.postId;
    comm.userLogin = comment.userLogin;
    comm.userId = comment.userId;
    await this.commentsRepo.manager.save(comm);
    return comm;
  }

  async findCommentById(commentId: string): Promise<CommentEntity | null> {
    return await this.commentsRepo.findOneBy({
      id: commentId,
      user: {
        isBanned: false,
      },
    });
  }

  async getCommentsByPost(postId, dto: PaginationCommentsDto) {
    let comments = await this.commentsRepo
      .createQueryBuilder("comments")
      .leftJoin("comments.user", "users")
      .where("comments.postId = :postId", { postId: postId })
      .andWhere("users.isBanned = false")
      .skip(dto.skipSize)
      .take(dto.pageSize)
      .orderBy(
        "comments." + dto.sortBy,
        dto.sortDirection === "asc" ? "ASC" : "DESC",
        "NULLS LAST",
      )
      .getMany();
    return comments;
    // const result = await this.commentsRepo.find({
    //     where: {postId: postId},
    //     skip: dto.skipSize,
    //     take: dto.pageSize,
    //     order: {  }
    //
    // })
    // return result
  }

  async updateComment(commentId: string, content: string) {
    return await this.commentsRepo.update(
      { id: commentId },
      { content: content },
    );
  }

  async deleteComment(commentId: string) {
    return await this.commentsRepo.delete(commentId);
  }

  async countComments(commentId: string) {
    return await this.commentsRepo.count({
      where: {
        postId: commentId,
        user: {
          isBanned: false,
        },
      },
    });
  }
}
