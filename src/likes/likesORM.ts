import { Repository } from "typeorm";
import { LikeEntity } from "./entities/like.entity";
import { ILikesRepo } from "./ILikesRepo";
import { InjectRepository } from "@nestjs/typeorm";
import { LikeStatusEnum } from "../likes/LikeStatusEnum";
import { PostEntity } from "../posts/entities/post.entity";
import { CommentEntity } from "../comments/entities/comment.entity";

export class LikesORM
  extends Repository<LikeEntity>
  implements ILikesRepo<LikeEntity>
{
  constructor(
    @InjectRepository(LikeEntity)
    private readonly likesRepo: Repository<LikeEntity>,
  ) {
    super(LikeEntity, likesRepo.manager, likesRepo.queryRunner);
  }

  async addReactionToComment(
    userId: string,
    commentId: string,
    likeStatus: LikeStatusEnum,
  ) {
    const result = await this.likesRepo.manager.upsert(
      LikeEntity,
      {
        userId: userId,
        commentId: commentId,
        reaction: likeStatus,
      },
      ["userId", "commentId"],
    );
    // console.log(result)
    return result;
  }

  async addReactionToPost(
    userId: string,
    postId: string,
    likeStatus: LikeStatusEnum,
  ) {
    const result = await this.likesRepo.upsert(
      {
        userId: userId,
        postId: postId,
        reaction: likeStatus,
      },
      ["userId", "postId"],
    );

    return result;
  }

  async getCommentLikeStatus(userId: string, commentId: string) {
    const like: LikeEntity = await this.likesRepo.findOneBy({
      commentId: commentId,
      userId: userId,
      user: {
        isBanned: false,
      },
    });
    return like ? like.reaction : LikeStatusEnum.None;

    // const result = this.likesRepository.createQueryBuilder()
    //     .select('reaction')
    //     .loadRelationCountAndMap('likesCount', 'reaction')
    //     .where({"commentId = :commentId": {commentId}})
    //     .groupBy('reaction')
  }

  async getLastLikesOnPost(postId: string) {
    const result = await this.likesRepo.find({
      select: {
        id: true,
        addedAt: true,
        userId: true,
        user: {
          login: true,
        },
      },
      relations: {
        user: true,
      },
      where: {
        postId: postId,
        reaction: "Like",
        user: {
          isBanned: false,
        },
      },
      order: {
        addedAt: "DESC",
      },
      take: 3,
    });
    const res = result.map((l) => {
      return {
        userId: l.userId,
        login: l.user.login,
        addedAt: l.addedAt,
      };
    });
    return res;
  }

  async getPostLikeStatus(userId: string, postId: string) {
    const like: LikeEntity = await this.likesRepo.findOneBy({
      postId: postId,
      userId: userId,
      user: {
        isBanned: false,
      },
    });
    return like ? like.reaction : LikeStatusEnum.None;
  }

  async getUserLikeStatusComment(userId: string, commentId: string) {
    const res = await this.likesRepo.findBy({
      commentId: commentId,
      user: {
        isBanned: false,
      },
    });
    // const result = this.likesRepository.createQueryBuilder()
    //     .select('reaction')
    //     .where({"commentId = :commentId": {commentId}})
    //     .andWhere({"userId = :userId": {userId}})
    return res;
  }

  async getUserLikeStatusPost(userId: string, postId: string) {
    const result = this.likesRepo
      .createQueryBuilder()
      .select("reaction")
      .where("postId = :postId", { postId })
      .andWhere("userId = :userId", { userId })
      .andWhere("user.isBanned = false");
    return result;
  }

  async getCommentLikeDislikeCounts(commentId: string) {
    const result = await this.likesRepo
      .createQueryBuilder("l")
      .leftJoin("users", "u", "l.userId = u.id")
      .select(
        `
            COALESCE(
                SUM(
                    CASE
                    WHEN l.reaction = 'Dislike' THEN 1
                    ELSE 0
                    END )
            ,0 )   
            `,
        "dislikesCount",
      )

      .addSelect(
        `
            COALESCE(
            SUM(
                CASE
                WHEN l.reaction = 'Like' THEN 1
                ELSE 0
                END )
                ,0)
            `,
        "likesCount",
      )

      .where("l.commentId = :commentId", { commentId })
      .andWhere("u.isBanned = false")

      .getRawOne();
    return result;
  }

  async getPostLikeDislikeCounts(postId: string) {
    const result = await this.likesRepo
      .createQueryBuilder("l")
      .leftJoin("users", "u", "l.userId = u.id")
      .select(
        `
            COALESCE(
                SUM(
                    CASE
                    WHEN l.reaction = 'Dislike' THEN 1
                    ELSE 0
                    END )
            ,0 )   
            `,
        "dislikesCount",
      )

      .addSelect(
        `
            COALESCE(
            SUM(
                CASE
                WHEN l.reaction = 'Like' THEN 1
                ELSE 0
                END )
                ,0)
            `,
        "likesCount",
      )

      .where("l.postId = :postId", { postId })
      .andWhere("u.isBanned = false")
      .getRawOne();
    return result;
  }

  async mapLikesToPostEntityToResponse(post: PostEntity, userId?: string) {
    const status = userId
      ? await this.getPostLikeStatus(userId, post.id)
      : LikeStatusEnum.None;
    const likesDislikesCount = await this.getPostLikeDislikeCounts(post.id);
    const lastLikes = await this.getLastLikesOnPost(post.id);

    const extendedLikesInfo = {
      likesCount: +likesDislikesCount.likesCount,
      dislikesCount: +likesDislikesCount.dislikesCount,
      myStatus: status,
      newestLikes: lastLikes,
    };
    const result = { ...post, extendedLikesInfo };
    return result;
  }

  async mapArrayPostEntitiesToResponse(posts: PostEntity[], userId?: string) {
    const result = [];
    for await (const post of posts) {
      result.push(await this.mapLikesToPostEntityToResponse(post, userId));
    }
    return result;
  }

  async mapLikesToCommentEntityToResponse(
    comment: CommentEntity,
    userId?: string,
  ) {
    const { postId, user, likes, ...rest } = comment;
    const likesDislikesCount = await this.getCommentLikeDislikeCounts(
      comment.id,
    );
    const status = userId
      ? await this.getCommentLikeStatus(userId, comment.id)
      : LikeStatusEnum.None;
    const likesInfo = {
      likesCount: +likesDislikesCount.likesCount,
      dislikesCount: +likesDislikesCount.dislikesCount,
      myStatus: status,
    };
    const res = {
      ...rest,
      likesInfo,
    };
    return res;
  }

  async mapArrayCommentEntitiesToResponse(
    comments: CommentEntity[],
    userId: string,
  ) {
    const result = [];
    for await (const comment of comments) {
      result.push(
        await this.mapLikesToCommentEntityToResponse(comment, userId),
      );
    }
    return result;
  }
}
