import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { AuthUtilsClass } from "../../auth/auth.utils";
import { CreateUserPaginatedDto } from "../dto/create.user.paginated.dto";

import { addDays } from "date-fns";

@Injectable()
export class UsersSQLRepo {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    protected readonly authUtils: AuthUtilsClass,
  ) {}

  async getAll({ pageNumber = 1, pageSize = 10 }: CreateUserPaginatedDto) {
    const skipSize = pageNumber > 1 ? pageSize * (pageNumber - 1) : 0;
    const users = await this.dataSource.query(
      `
            SELECT * 
            FROM USERS
            ORDER BY id
            LIMIT $1 OFFSET $2
        `,
      [pageSize, skipSize],
    );
    const docCount = await this.countDocuments();
    return {
      pagesCount: Math.ceil(docCount[0].total / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: docCount[0].total,
      items: users,
    };
  }
  async countDocuments() {
    // return this.bloggerModel.countDocuments(filter);

    const result = await this.dataSource.query(
      `
                SELECT 
                CASE
                    WHEN COUNT(*) > 0 THEN COUNT(*)
                    ELSE 0
                END AS total
                FROM users
                    `,
      [],
    );
    return result;
  }

  async createUser(
    login: string,
    email: string,
    passwordHash: string,
    code: string,
  ) {
    const result = await this.dataSource.query(
      `
                INSERT INTO users (login, email,  "passwordHash", "confirmationCode", "expirationDate")
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, login
                    `,
      [login, email, passwordHash, code, addDays(new Date(), 1)],
    );

    return result;
  }

  async delete(id: string) {
    const result = await this.dataSource.query(
      `
                DELETE FROM users
                WHERE id = $1
                    `,
      [id],
    );
    return result;
  }

  // async findOne(userFilterQuery: FilterQuery<User>): Promise<UserDocument> | null {
  //     return this.userModel.findOne(userFilterQuery)
  // }

  async checkLoginEmailExists(
    login: string,
    email: string,
  ): Promise<string> | null {
    const isLoginExists = await this.dataSource.query(
      `
                SELECT login
                FROM users
                WHERE login = $1
                `,
      [login],
    );
    const isEmailExists = await this.dataSource.query(
      `
                SELECT email
                FROM users
                WHERE email = $1
                `,
      [email],
    );
    if (isLoginExists.length > 0) return "login already exists";
    if (isEmailExists.length > 0) return "email already exists";
    return null;
  }

  async checkCodeExists(code: string) {
    const isExists = await this.dataSource.query(
      `
         SELECT "isConfirmed"
                FROM users
                WHERE "confirmationCode" = $1
                `,
      [code],
    );
    if (isExists.length == 0) {
      return false;
    } else {
      return isExists;
    }
  }

  async confirmEmail(code: string) {
    const confirm = await this.dataSource.query(
      `
            UPDATE users
            SET "isConfirmed" = TRUE
            WHERE "confirmationCode" = $1
            RETURNING *
            `,
      [code],
    );

    //TODO Add login attempt
    //         $push: {
    //             loginAttempts: {
    //                 attemptDate: new Date(),
    //                 ip: ip
    return confirm;
  }

  async updateConfirmationCode(email: string, code: any) {
    const confirm = await this.dataSource.query(
      `
            UPDATE users
            SET "confirmationCode" = $1,
            "expirationDate" = $2
            WHERE email = $3
            RETURNING *
            `,
      [code, addDays(new Date(), 1), email],
    );

    //TODO Add login attempt

    return confirm;
  }

  async findByEmail(email: string) {
    const user = await this.dataSource.query(
      `
            SELECT email
                FROM users
                WHERE email = $1
                `,
      [email],
    );
    if (user.length == 0) {
      return false;
    } else {
      return user;
    }
  }

  async findByLogin(login: string) {
    const user = await this.dataSource.query(
      `
            SELECT id, login, "passwordHash"
                FROM users
                WHERE login = $1
                `,
      [login],
    );
    if (user.length == 0) {
      return false;
    } else {
      return user;
    }
  }
  async findById(id: string) {
    const user = await this.dataSource.query(
      `
            SELECT id, email, login
                FROM users
                WHERE id = $1
                `,
      [id],
    );
    return user;
  }

  async checkCredentials(login: string, password: string) {
    //ищем юзера по логину
    const user = await this.findByLogin(login);
    //если не нашли выходим с нулл
    //если стоит флаг не подтвержден имейл - выходим с нулл
    if (user.length == 0 || !user[0]["confirmationCode"]) {
      return false;
    }

    const isHashesEquals = await this.authUtils._isHashesEquals(
      password,
      user.passwordHash,
    );
    //проверяем хэш пароля
    if (isHashesEquals) {
      return user;
    } else {
      return false;
    }
  }

  // async getTotalLikesOnPost(postId: string) {
  //     const likes = await this.userModel.aggregate([
  //         {$match: {'reactedPosts.postId': postId}},
  //         {$unwind: {path: "$reactedPosts", preserveNullAndEmptyArrays: true}},
  //         {$match: {'reactedPosts.postId': postId, 'reactedPosts.status': LikeStatusEnum.Like}},
  //         {$count: 'totalLikes'},
  //         // {$match: {'reactedPosts.postId': postId}},
  //         // {$group: {_id: "$reactedPosts.status", totalLikes: {$count: postId}}},
  //         // {$match: {'reactedPosts.postId': postId, 'reactedPosts.status': LikeStatusEnum.Dislike}},
  //         // {$count: 'totalDislikes'}
  //     ])
  //     return likes.length > 0 ? (likes[0].totalLikes) : 0
  // }
  //
  // async getTotalDislikesOnPost(postId: string) {
  //     // console.log('postId', postId)
  //     const dislikes = await this.userModel.aggregate([
  //         {$match: {'reactedPosts.postId': postId}},
  //         // {$match: {'reactedPosts.postId': postId},{'reactedPosts.$.status': LikeStatusEnum.Dislike}] }
  //         {$unwind: {path: "$reactedPosts", preserveNullAndEmptyArrays: true}},
  //         {$match: {'reactedPosts.postId': postId, 'reactedPosts.status': LikeStatusEnum.Dislike}},
  //
  //         // {$count: 'totalDislikes'},
  //         // {$group: {_id: "$reactedPosts.status", totalLikes: {$count: "$reactedPosts.status"}}},
  //         // {$match: {'reactedPosts.postId': postId, 'reactedPosts.status': LikeStatusEnum.Dislike}},
  //         {$count: 'totalDislikes'}
  //     ])
  //     // console.log('dislikes', dislikes)
  //     return dislikes.length > 0 ? (dislikes[0].totalDislikes) : 0
  // }
  //
  // async getLastLikes(postId: string) {
  //     const lastLikes = await this.userModel.aggregate([
  //         {$unwind: {path: "$reactedPosts", preserveNullAndEmptyArrays: true}},
  //         {$project: {'reactedPosts.status': 1, 'reactedPosts.modifiedAt': 1, 'reactedPosts.postId': 1}},
  //         {$match: {'reactedPosts.status': 'Like'}},
  //         {$match: {'reactedPosts.postId': postId}},
  //         {$sort: {'reactedPosts.modifiedAt': -1}},
  //         {$unwind: {path: "$reactedPosts", preserveNullAndEmptyArrays: true}},
  //         {$project: {userId: "$_id", addedAt: '$reactedPosts.modifiedAt', _id: 0}},
  //     ])
  //
  //     for (let i = 0; i < lastLikes.length; i++) {
  //         let a = await this.userModel.findById(lastLikes[i].userId).select('accountData.login')
  //         lastLikes[i].login = a.accountData.login
  //     }
  //
  //
  //     return lastLikes.slice(0, 3)
  // }
  //
  // // $push: {last}
  // // $sort: { modifiedAt: -1 },
  // // $slice: 3
  //
  //
  // async setNewCommentReaction(userId: string, commentId: string, likeStatus: LikeStatusEnum) {
  //
  //     const isUserExists = await this.userModel.findById(userId)
  //     if (!isUserExists) {
  //         throw  new NotFoundException('net takogo usera iz access tokena')
  //     }
  //
  //
  //     const alreadyReacted = await this.userModel.findOne({_id: userId, 'reactedComments.commentId': commentId})
  //
  //
  //     if (!alreadyReacted) {
  //         return this.userModel.findOneAndUpdate(
  //             {_id: userId},
  //             {
  //                 $push: {
  //                     reactedComments: {
  //                         commentId,
  //                         status: likeStatus,
  //                         modifiedAt: new Date()
  //                     }
  //                 }
  //             },
  //             {new: true});
  //     } else {
  //         return this.userModel.findOneAndUpdate(
  //             {_id: userId, 'reactedComments.commentId': commentId},
  //             {
  //                 $set: {
  //                     'reactedComments.$': {
  //                         commentId,
  //                         status: likeStatus,
  //                         modifiedAt: new Date()
  //
  //                     }
  //                 }
  //             },
  //             {new: true});
  //     }
  // }
  //
  //
  //
  //     // const alreadyReacted = await this.userModel.findOne({_id: userId, 'reactedComments.commentId': commentId})
  //     // if (!alreadyReacted) {
  //     //     this.userModel.findOne({_id: userId}, {}, {},
  //     //         function (err, user) {
  //     //             if (err) {
  //     //             } else {
  //     //                 user.reactedComments.push({
  //     //                     commentId: commentId,
  //     //                     status: likeStatus,
  //     //                     modifiedAt: new Date()
  //     //                 })
  //     //                 user.save()
  //     //             }
  //     //
  //     //         })
  //     // } else {
  //     //     return this.userModel.findOneAndUpdate(
  //     //         {_id: userId, 'reactedComments.commentId': commentId},
  //     //         {
  //     //             $set: {
  //     //                 'reactedComments.$': {
  //     //                     commentId,
  //     //                     status: likeStatus,
  //     //                     modifiedAt: new Date()
  //     //                 }
  //     //             }
  //     //         },
  //     //         {new: true,});
  //     // }
  //
  //     ////////////////////////
  //
  //     // return this.userModel.findOneAndUpdate(
  //     //     {_id: userId},
  //     //     {
  //     //         $push: {
  //     //             reactedComments: {
  //     //                 commentId: commentId,
  //     //                 status: likeStatus,
  //     //                 modifiedAt: new Date()
  //     //             }
  //     //         }
  //     //     },
  //     //     {new: true});
  //
  //
  //
  // async setNewPostReaction(userId: string, postId: string, likeStatus: LikeStatusEnum) {
  //     const isUserExists = await this.userModel.findById(userId)
  //     if (!isUserExists) {
  //         throw  new NotFoundException('net takogo usera iz access tokena')
  //     }
  //
  //
  //     const alreadyReacted = await this.userModel.findOne({_id: userId, 'reactedPosts.postId': postId})
  //
  //
  //     if (!alreadyReacted) {
  //         return this.userModel.findOneAndUpdate(
  //             {_id: userId},
  //             {
  //                 $push: {
  //                     reactedPosts: {
  //                         postId,
  //                         status: likeStatus,
  //                         modifiedAt: new Date()
  //                     }
  //                 }
  //             },
  //             {new: true});
  //     } else {
  //         return this.userModel.findOneAndUpdate(
  //             {_id: userId, 'reactedPosts.postId': postId},
  //             {
  //                 $set: {
  //                     'reactedPosts.$': {
  //                         postId,
  //                         status: likeStatus,
  //                         modifiedAt: new Date()
  //
  //                     }
  //                 }
  //             },
  //             {new: true});
  //     }
  // }
  //
  // async getTotalLikesOnComment(commentId: string) {
  //     const likes = await this.userModel.aggregate([
  //         {$match: {'reactedComments.commentId': commentId}},
  //         {$unwind: {path: "$reactedComments", preserveNullAndEmptyArrays: true}},
  //         {$match: {'reactedComments.commentId': commentId, 'reactedComments.status': LikeStatusEnum.Like}},
  //         {$count: 'totalLikes'}
  //
  //         // {$count: 'totalDislikes'},
  //         // {$group: {_id: "$reactedPosts.status", totalLikes: {$count: "$reactedPosts.status"}}},
  //         // {$match: {'reactedPosts.postId': postId, 'reactedPosts.status': LikeStatusEnum.Dislike}},
  //     ])
  //     console.log('likes', likes)
  //     return likes.length > 0 ? (likes[0].totalLikes) : 0
  //     // const likes = await this.userModel.aggregate([
  //     //     {$match: {'reactedComments.commentId': commentId, 'reactedComments.status': LikeStatusEnum.Like}},
  //     //     {$count: 'totalLikes'},
  //     //     // {$match: {'reactedPosts.postId': postId}},
  //     //     // {$group: {_id: "$reactedPosts.status", totalLikes: {$count: postId}}},
  //     //     // {$match: {'reactedPosts.postId': postId, 'reactedPosts.status': LikeStatusEnum.Dislike}},
  //     //     // {$count: 'totalDislikes'}
  //     // ])
  //     // return likes.length > 0 ? (likes[0].totalLikes) : 0
  // }
  //
  // async getTotalDislikesOnComment(commentId: string) {
  //     // console.log('commentId', commentId)
  //     const dislikes = await this.userModel.aggregate([
  //         {$match: {'reactedComments.commentId': commentId}},
  //         // {$match: {'reactedPosts.postId': postId},{'reactedPosts.$.status': LikeStatusEnum.Dislike}] }
  //         {$unwind: {path: "$reactedComments", preserveNullAndEmptyArrays: true}},
  //         {$match: {'reactedComments.commentId': commentId, 'reactedComments.status': LikeStatusEnum.Dislike}},
  //
  //         // {$count: 'totalDislikes'},
  //         // {$group: {_id: "$reactedPosts.status", totalLikes: {$count: "$reactedPosts.status"}}},
  //         // {$match: {'reactedPosts.postId': postId, 'reactedPosts.status': LikeStatusEnum.Dislike}},
  //         {$count: 'totalDislikes'}
  //     ])
  //     // console.log('dislikes', dislikes)
  //     return dislikes.length > 0 ? (dislikes[0].totalDislikes) : 0
  //     // const dislikes = await this.userModel.aggregate([
  //     //     {$match: {'reactedComments.commentId': commentId, 'reactedComments.status': LikeStatusEnum.Dislike}},
  //     //     {$count: 'totalDislikes'},
  //     //     // {$match: {'reactedPosts.postId': postId}},
  //     //     // {$group: {_id: "$reactedPosts.status", totalLikes: {$count: postId}}},
  //     //     // {$match: {'reactedPosts.postId': postId, 'reactedPosts.status': LikeStatusEnum.Dislike}},
  //     //     // {$count: 'totalDislikes'}
  //     // ])
  //     // return dislikes.length > 0 ? (dislikes[0].totalDislikes) : 0
  // }
  //
  //
  // async getUsersReactionOnPost(postId: string, userId: string) {
  //     const isReacted = await this.userModel.findOne({
  //         _id: userId,
  //         'reactedPosts.postId': postId
  //     })
  //     // console.log('isReacted', isReacted._id)
  //     if (!isReacted) {
  //         return 'None'
  //     }
  //     // console.log('postId', new ObjectId(postId))
  //     // console.log('userId', new ObjectId(userId))
  //     const reaction = await this.userModel.aggregate([
  //         {$match: {_id: new mongoose.Types.ObjectId(userId)}},
  //         {$unwind: {path: "$reactedPosts", preserveNullAndEmptyArrays: true}},
  //         {$match: {'reactedPosts.postId': postId.toString()}},
  //         {$project: {status: '$reactedPosts.status', _id: 0}},
  //
  //
  //
  //         // {$replaceRoot: {newRoot: "$reactedPosts"}}
  //         // {$match: {_id:userId}},
  //         // {$and: [{_id: userId}, {'reactedPosts.postId': postId}]}, {'reactedPosts.status': 1, _id: 0})
  //     ])
  //     // const reaction = this.userModel.findOne(
  //     //     {
  //     //         $and: [{
  //     //             _id: userId
  //     //         },
  //     //             {
  //     //                 'reactedPosts.postId': postId
  //     //             }]
  //     //     })
  //     // console.log(reaction)
  //     return reaction[0].status
  //
  // }
  //
  // async getUsersReactionOnComment(commentId: string, userId: any) {
  //
  //     const isReacted = await this.userModel.findOne({
  //         _id: userId,
  //         'reactedComments.commentId': commentId
  //     })
  //     if (!isReacted) {
  //         return 'None'
  //     }
  //     const reaction = await this.userModel.aggregate([
  //         {$match: {_id: new ObjectId(userId)}},
  //         {$unwind: {path: "$reactedComments", preserveNullAndEmptyArrays: true}},
  //         {$match: {'reactedComments.commentId': commentId}},
  //         {$project: {status: '$reactedComments.status', _id: 0}},
  //     ])
  //
  //     return reaction[0].status
  //
  // }
}
