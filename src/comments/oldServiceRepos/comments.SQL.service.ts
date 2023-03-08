import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CommentsSQLRepo } from "./comments.SQL.repo";
import { LikeStatusEnum } from "../../likes/LikeStatusEnum";
import { LikesSQLService } from "../../likes/oldServiceRepos/likes.SQL.service";
import { ACommentService } from "./ICommentService";
import { UsersSQLRepo } from "../../users/oldServiceRepos/users.SQL.repo";

@Injectable()
export class CommentsSQLService implements ACommentService {
  constructor(
    protected readonly commentsRepo: CommentsSQLRepo,
    protected readonly usersRepo: UsersSQLRepo,
    protected readonly likesService: LikesSQLService,
  ) {}

  // from posts route
  async getCommentsByPost(
    postId: string,
    PageSize: number,
    PageNumber: number,
    userId?: string,
  ) {
    const skipSize = PageNumber > 1 ? PageSize * (PageNumber - 1) : 0;
    const comments = await this.commentsRepo.getCommentsByPost(
      postId,
      skipSize,
      PageSize,
    );

    for (const c of comments) {
      c.likesInfo = await this.likesService.getCommentLikeInfo(userId, c.id);
    }

    const docCount = await this.commentsRepo.countDocuments({ postId: postId });

    const result = {
      pagesCount: Math.ceil(docCount[0].total / PageSize),
      page: PageNumber,
      pageSize: PageSize,
      totalCount: docCount[0].total,
      items: comments,
    };
    return result;
  }

  // from posts route
  async createCommentByPost(
    login: string,
    userId: string,
    postId: string,
    content: string,
  ) {
    const comment = {
      content: content,
      userId: userId,
      userLogin: login,
      addedAt: new Date(),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: "None",
      },
      postId: postId,
    };
    const createdComment = await this.commentsRepo.createComment(comment);
    createdComment[0].likesInfo = comment.likesInfo;

    return createdComment[0];
  }

  async getCommentById(id: string, userId?: string) {
    try {
      const comment = await this.commentsRepo.findById(id);
      if (comment.length == 0) {
        throw new NotFoundException("net takogo kommenta");
      }
      comment[0].likesInfo = await this.likesService.getCommentLikeInfo(
        userId,
        id,
      );
      return comment[0];
    } catch (e: any) {
      if (e.name == "NotFoundException") {
        throw new NotFoundException("net takogo comments");
      } else throw new BadRequestException(e);
    }
  }

  async updateCommentById(commentId: string, content: string, userId?: string) {
    const comment = await this.getCommentById(commentId);
    if (userId != comment.userId) {
      throw new ForbiddenException("Hey, its not yours comment");
    }
    const updatedComment = await this.commentsRepo.updateComment(
      commentId,
      content,
    );
    return updatedComment;
  }

  async removeCommentById(commentId: string, userId?: string) {
    const comment = await this.getCommentById(commentId);
    if (userId != comment.userId) {
      throw new ForbiddenException("Hey, its not yours comment, dude))");
    }
    return await this.commentsRepo.deleteComment(commentId);
  }

  async setLikeStatus(
    userId: string,
    commentId: string,
    likeStatus: LikeStatusEnum,
  ) {
    return await this.likesService.addReactionToComment(
      userId,
      commentId,
      likeStatus,
    );
    // const isUserInDb = await this.usersRepo.findOne({_id: userId})
    // if (!isUserInDb) {
    //     throw new BadRequestException('userId is not in Database')
    // }
    //
    // // (WRITE) - Create/Update 'reactedComments' subrecord  about like reaction in acting user USERModel by userId and commentId
    // const reactedUser = await this.usersRepo.setNewCommentReaction(userId, commentId, likeStatus)
    // // (READ) - Return aggregated info from all users about this commentId,
    // // to collect counts of likes, dislikes
    // const totalLikes = await this.usersRepo.getTotalLikesOnComment(commentId)
    // const totalDislikes = await this.usersRepo.getTotalDislikesOnComment(commentId)
    //
    // // const last3Likes = await this.usersRepo.getLastLikesOnComment(commentId)
    // // console.log(totalDislikes, totalLikes)
    //
    // const updatedComment = await this.commentsRepo.updateCommentWithLike(commentId, totalLikes, totalDislikes, likeStatus)
    //
    //
    // return updatedComment
  }

  async findCommentByIdOnUserId(commentId: string, userId: any) {
    // const comment = await this.commentsRepo.findById(commentId)
    // if (comment.length == 0) {
    //     throw new BadRequestException('commentId net takogo comment')
    // }
    // const UserReactionOnComment = await this.usersRepo.getUsersReactionOnComment(commentId, userId)
    // if (UserReactionOnComment) {
    //     comment.likesInfo.myStatus = UserReactionOnComment
    //     // console.log(comment)
    //     // return comment
    // }
    // // let {_id, content, userId, userLogin, ...rest} = comment
    // const mappedComment = {
    //     id: comment._id,
    //     content: comment.content,
    //     userId: comment.userId,
    //     userLogin: comment.userLogin,
    //     addedAt: comment.addedAt,
    //     likesInfo: comment.likesInfo
    //
    // }
    // return mappedComment
  }

  async getCommentsByPostAuthUser(
    postId: string,
    userId: string,
    PageSize: number | 10,
    PageNumber: number | 1,
  ) {
    // const skipSize = (PageNumber > 1) ? (PageSize * (PageNumber - 1)) : 0
    // const comments = await this.commentsRepo.getCommentsByPost(postId, skipSize, PageSize)
    //
    // for (let i = 0; i < comments.length; i++) {
    //     let userReactionStatus = await this.usersRepo.getUsersReactionOnComment(comments[i].id, userId)
    //     comments[i].likesInfo.myStatus = userReactionStatus
    // }
    //
    // const docCount = await this.commentsRepo.countDocuments({postId: postId});
    //
    // const mappedComment = comments.map((c) => {
    //         return {
    //             id: c._id,
    //             content: c.content,
    //             userId: c.userId,
    //             userLogin: c.userLogin,
    //             addedAt: c.addedAt,
    //             likesInfo: c.likesInfo
    //         }
    //     }
    // )
    //
    // const result = {
    //     "pagesCount": Math.ceil(docCount / PageSize),
    //     "page": PageNumber,
    //     "pageSize": PageSize,
    //     "totalCount": docCount,
    //     "items": mappedComment
    // }
    //
    // return result
  }
}
