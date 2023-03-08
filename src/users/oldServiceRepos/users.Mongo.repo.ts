import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import mongoose, {FilterQuery, Model, Types} from "mongoose";
import {User, UserDocument} from "../user.schema";
import {InjectModel} from "@nestjs/mongoose";
import {CreateUserPaginatedDto} from "../dto/create.user.paginated.dto";
import {AuthUtilsClass} from "../../auth/auth.utils";
import {LikeStatusEnum} from "../../comments/comment.schema";
import {ObjectId} from "mongodb";

@Injectable()
export class UsersMongoRepo {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>,
                protected readonly authUtils: AuthUtilsClass) {
    }

    async getAll({pageNumber = 1, pageSize = 10}: CreateUserPaginatedDto) {
        // return await this.userModel.find({login: term}).exec();
        const skipSize = (pageNumber > 1) ? (pageSize * (pageNumber - 1)) : 0
        const users = await this.userModel.find({}).skip(skipSize).limit(pageSize).exec();
        const mappedUsers = users.map((u) => {
            return {id: u.id, login: u.accountData.login}
        })
        const docCount = await this.userModel.countDocuments({})
        return {
            "pagesCount": Math.ceil(docCount / pageSize),
            "page": pageNumber,
            "pageSize": pageSize,
            "totalCount": docCount,
            "items": mappedUsers

        }
    }


    async createUser(dto: User) {
        // mongoose unique:true validator handler
        try {
            const newUser = new this.userModel(dto)
            await newUser.save()

            return {
                id: newUser.id,
                login: newUser.accountData.login
                // login: newUser.login
            }

        } catch (e) {
            const errorsMessages = [`${Object.keys(e.keyPattern)[0]} must be unique, '${Object.values(e.keyValue)}' already exist`];
            // const errorsMessages: object = [{ message: `Field '${Object.keys(e.keyPattern)[0]}' must be unique, '${Object.values(e.keyValue)[0]}' already exist`, field: Object.keys(e.keyPattern)[0] }];
            // console.log(Object.keys(e))
            // console.log( e)
            // console.log(e.code)
            // console.log(Object.keys(e.keyPattern)[0])

            throw new BadRequestException(errorsMessages, 'unique shit happens')
            // return errorResponse
        }


    }

    async delete(id: string) {
        const deleteResult = await this.userModel.findByIdAndDelete(id)
        if (!deleteResult) {
            throw new NotFoundException('Specified user not exists')
        }
        return true
    }

    async findOne(userFilterQuery: FilterQuery<User>): Promise<UserDocument> | null {
        return this.userModel.findOne(userFilterQuery)
    }

    async checkLoginEmailExists(login: string, email: string): Promise<string> | null {
        const isLoginExists = await this.userModel.findOne({"accountData.login": login})

        // console.log(isLoginExists)
        const isEmailExists = await this.userModel.findOne({"accountData.email": email}).exec()
        if (isLoginExists) return 'login already exists'
        if (isEmailExists) return 'email already exists'
        return null

    }


    async checkCodeExists(code: string) {
        const isExists = await this.userModel.findOne({"emailConfirmation.confirmationCode": code})
        if (!isExists) {
            return false
        } else {
            return isExists
        }

    }

    async confirmEmail(code: string, ip: string) {
        const userInstance = await this.userModel.findOneAndUpdate(
            {"emailConfirmation.confirmationCode": code},
            {
                $set: {"emailConfirmation.isConfirmed": true},
                $push: {
                    loginAttempts: {
                        attemptDate: new Date(),
                        ip: ip
                    }
                }
            },
            {returnDocument: "after"}
        )
        if (!userInstance) return false
        userInstance.save()

        return userInstance

    }

    async findByEmail(email: string) {

        const userInstance = await this.userModel.findOne(
            {
                "accountData.email": email
            },
            {}
        )

        if (!userInstance) {
            return false
        } else {
            // console.log('user already pre-registered/exist')
            return userInstance
        }

    }

    async findByLogin(login: string) {

        const userInstance = await this.userModel.findOne(
            {
                "accountData.login": login
            },
            {}
        )

        if (!userInstance) {
            return false
        } else {
            // console.log('user already pre-registered/exist')
            return userInstance
        }

    }

    async checkCredentials(login: string, password: string) {


        //ищем юзера по логину
        const user = await this.findByLogin(login)
        //если не нашли выходим с нулл
        //если стоит флаг не подтвержден имейл - выходим с нулл
        if ((!user) || (!user.emailConfirmation.isConfirmed)) {
            return false
        }


        // const passwordHash = await this._generateHash(password)
        const isHashesEquals = await this.authUtils._isHashesEquals(password, user.accountData.passwordHash)
        //проверяем хэш пароля
        if (isHashesEquals) {
            return user
        } else {
            return false
        }
    }


    async getTotalLikesOnPost(postId: string) {
        const likes = await this.userModel.aggregate([
            {$match: {'reactedPosts.postId': postId}},
            {$unwind: {path: "$reactedPosts", preserveNullAndEmptyArrays: true}},
            {$match: {'reactedPosts.postId': postId, 'reactedPosts.status': LikeStatusEnum.Like}},
            {$count: 'totalLikes'},
            // {$match: {'reactedPosts.postId': postId}},
            // {$group: {_id: "$reactedPosts.status", totalLikes: {$count: postId}}},
            // {$match: {'reactedPosts.postId': postId, 'reactedPosts.status': LikeStatusEnum.Dislike}},
            // {$count: 'totalDislikes'}
        ])
        return likes.length > 0 ? (likes[0].totalLikes) : 0
    }

    async getTotalDislikesOnPost(postId: string) {
        // console.log('postId', postId)
        const dislikes = await this.userModel.aggregate([
            {$match: {'reactedPosts.postId': postId}},
            // {$match: {'reactedPosts.postId': postId},{'reactedPosts.$.status': LikeStatusEnum.Dislike}] }
            {$unwind: {path: "$reactedPosts", preserveNullAndEmptyArrays: true}},
            {$match: {'reactedPosts.postId': postId, 'reactedPosts.status': LikeStatusEnum.Dislike}},

            // {$count: 'totalDislikes'},
            // {$group: {_id: "$reactedPosts.status", totalLikes: {$count: "$reactedPosts.status"}}},
            // {$match: {'reactedPosts.postId': postId, 'reactedPosts.status': LikeStatusEnum.Dislike}},
            {$count: 'totalDislikes'}
        ])
        // console.log('dislikes', dislikes)
        return dislikes.length > 0 ? (dislikes[0].totalDislikes) : 0
    }

    async getLastLikes(postId: string) {
        const lastLikes = await this.userModel.aggregate([
            {$unwind: {path: "$reactedPosts", preserveNullAndEmptyArrays: true}},
            {$project: {'reactedPosts.status': 1, 'reactedPosts.modifiedAt': 1, 'reactedPosts.postId': 1}},
            {$match: {'reactedPosts.status': 'Like'}},
            {$match: {'reactedPosts.postId': postId}},
            {$sort: {'reactedPosts.modifiedAt': -1}},
            {$unwind: {path: "$reactedPosts", preserveNullAndEmptyArrays: true}},
            {$project: {userId: "$_id", addedAt: '$reactedPosts.modifiedAt', _id: 0}},
        ])

        for (let i = 0; i < lastLikes.length; i++) {
            let a = await this.userModel.findById(lastLikes[i].userId).select('accountData.login')
            lastLikes[i].login = a.accountData.login
        }


        return lastLikes.slice(0, 3)
    }

    // $push: {last}
    // $sort: { modifiedAt: -1 },
    // $slice: 3


    async setNewCommentReaction(userId: string, commentId: string, likeStatus: LikeStatusEnum) {

        const isUserExists = await this.userModel.findById(userId)
        if (!isUserExists) {
            throw  new NotFoundException('net takogo usera iz access tokena')
        }


        const alreadyReacted = await this.userModel.findOne({_id: userId, 'reactedComments.commentId': commentId})


        if (!alreadyReacted) {
            return this.userModel.findOneAndUpdate(
                {_id: userId},
                {
                    $push: {
                        reactedComments: {
                            commentId,
                            status: likeStatus,
                            modifiedAt: new Date()
                        }
                    }
                },
                {new: true});
        } else {
            return this.userModel.findOneAndUpdate(
                {_id: userId, 'reactedComments.commentId': commentId},
                {
                    $set: {
                        'reactedComments.$': {
                            commentId,
                            status: likeStatus,
                            modifiedAt: new Date()

                        }
                    }
                },
                {new: true});
        }
    }



        // const alreadyReacted = await this.userModel.findOne({_id: userId, 'reactedComments.commentId': commentId})
        // if (!alreadyReacted) {
        //     this.userModel.findOne({_id: userId}, {}, {},
        //         function (err, user) {
        //             if (err) {
        //             } else {
        //                 user.reactedComments.push({
        //                     commentId: commentId,
        //                     status: likeStatus,
        //                     modifiedAt: new Date()
        //                 })
        //                 user.save()
        //             }
        //
        //         })
        // } else {
        //     return this.userModel.findOneAndUpdate(
        //         {_id: userId, 'reactedComments.commentId': commentId},
        //         {
        //             $set: {
        //                 'reactedComments.$': {
        //                     commentId,
        //                     status: likeStatus,
        //                     modifiedAt: new Date()
        //                 }
        //             }
        //         },
        //         {new: true,});
        // }

        ////////////////////////

        // return this.userModel.findOneAndUpdate(
        //     {_id: userId},
        //     {
        //         $push: {
        //             reactedComments: {
        //                 commentId: commentId,
        //                 status: likeStatus,
        //                 modifiedAt: new Date()
        //             }
        //         }
        //     },
        //     {new: true});



    async setNewPostReaction(userId: string, postId: string, likeStatus: LikeStatusEnum) {
        const isUserExists = await this.userModel.findById(userId)
        if (!isUserExists) {
            throw  new NotFoundException('net takogo usera iz access tokena')
        }


        const alreadyReacted = await this.userModel.findOne({_id: userId, 'reactedPosts.postId': postId})


        if (!alreadyReacted) {
            return this.userModel.findOneAndUpdate(
                {_id: userId},
                {
                    $push: {
                        reactedPosts: {
                            postId,
                            status: likeStatus,
                            modifiedAt: new Date()
                        }
                    }
                },
                {new: true});
        } else {
            return this.userModel.findOneAndUpdate(
                {_id: userId, 'reactedPosts.postId': postId},
                {
                    $set: {
                        'reactedPosts.$': {
                            postId,
                            status: likeStatus,
                            modifiedAt: new Date()

                        }
                    }
                },
                {new: true});
        }
    }

    async getTotalLikesOnComment(commentId: string) {
        const likes = await this.userModel.aggregate([
            {$match: {'reactedComments.commentId': commentId}},
            {$unwind: {path: "$reactedComments", preserveNullAndEmptyArrays: true}},
            {$match: {'reactedComments.commentId': commentId, 'reactedComments.status': LikeStatusEnum.Like}},
            {$count: 'totalLikes'}

            // {$count: 'totalDislikes'},
            // {$group: {_id: "$reactedPosts.status", totalLikes: {$count: "$reactedPosts.status"}}},
            // {$match: {'reactedPosts.postId': postId, 'reactedPosts.status': LikeStatusEnum.Dislike}},
        ])
        return likes.length > 0 ? (likes[0].totalLikes) : 0
        // const likes = await this.userModel.aggregate([
        //     {$match: {'reactedComments.commentId': commentId, 'reactedComments.status': LikeStatusEnum.Like}},
        //     {$count: 'totalLikes'},
        //     // {$match: {'reactedPosts.postId': postId}},
        //     // {$group: {_id: "$reactedPosts.status", totalLikes: {$count: postId}}},
        //     // {$match: {'reactedPosts.postId': postId, 'reactedPosts.status': LikeStatusEnum.Dislike}},
        //     // {$count: 'totalDislikes'}
        // ])
        // return likes.length > 0 ? (likes[0].totalLikes) : 0
    }

    async getTotalDislikesOnComment(commentId: string) {
        // console.log('commentId', commentId)
        const dislikes = await this.userModel.aggregate([
            {$match: {'reactedComments.commentId': commentId}},
            // {$match: {'reactedPosts.postId': postId},{'reactedPosts.$.status': LikeStatusEnum.Dislike}] }
            {$unwind: {path: "$reactedComments", preserveNullAndEmptyArrays: true}},
            {$match: {'reactedComments.commentId': commentId, 'reactedComments.status': LikeStatusEnum.Dislike}},

            // {$count: 'totalDislikes'},
            // {$group: {_id: "$reactedPosts.status", totalLikes: {$count: "$reactedPosts.status"}}},
            // {$match: {'reactedPosts.postId': postId, 'reactedPosts.status': LikeStatusEnum.Dislike}},
            {$count: 'totalDislikes'}
        ])
        // console.log('dislikes', dislikes)
        return dislikes.length > 0 ? (dislikes[0].totalDislikes) : 0
        // const dislikes = await this.userModel.aggregate([
        //     {$match: {'reactedComments.commentId': commentId, 'reactedComments.status': LikeStatusEnum.Dislike}},
        //     {$count: 'totalDislikes'},
        //     // {$match: {'reactedPosts.postId': postId}},
        //     // {$group: {_id: "$reactedPosts.status", totalLikes: {$count: postId}}},
        //     // {$match: {'reactedPosts.postId': postId, 'reactedPosts.status': LikeStatusEnum.Dislike}},
        //     // {$count: 'totalDislikes'}
        // ])
        // return dislikes.length > 0 ? (dislikes[0].totalDislikes) : 0
    }


    async getUsersReactionOnPost(postId: string, userId: string) {
        const isReacted = await this.userModel.findOne({
            _id: userId,
            'reactedPosts.postId': postId
        })
        // console.log('isReacted', isReacted._id)
        if (!isReacted) {
            return 'None'
        }
        // console.log('postId', new ObjectId(postId))
        // console.log('userId', new ObjectId(userId))
        const reaction = await this.userModel.aggregate([
            {$match: {_id: new mongoose.Types.ObjectId(userId)}},
            {$unwind: {path: "$reactedPosts", preserveNullAndEmptyArrays: true}},
            {$match: {'reactedPosts.postId': postId.toString()}},
            {$project: {status: '$reactedPosts.status', _id: 0}},



            // {$replaceRoot: {newRoot: "$reactedPosts"}}
            // {$match: {_id:userId}},
            // {$and: [{_id: userId}, {'reactedPosts.postId': postId}]}, {'reactedPosts.status': 1, _id: 0})
        ])
        // const reaction = this.userModel.findOne(
        //     {
        //         $and: [{
        //             _id: userId
        //         },
        //             {
        //                 'reactedPosts.postId': postId
        //             }]
        //     })
        // console.log(reaction)
        return reaction[0].status

    }

    async getUsersReactionOnComment(commentId: string, userId: any) {

        const isReacted = await this.userModel.findOne({
            _id: userId,
            'reactedComments.commentId': commentId
        })
        if (!isReacted) {
            return 'None'
        }
        const reaction = await this.userModel.aggregate([
            {$match: {_id: new ObjectId(userId)}},
            {$unwind: {path: "$reactedComments", preserveNullAndEmptyArrays: true}},
            {$match: {'reactedComments.commentId': commentId}},
            {$project: {status: '$reactedComments.status', _id: 0}},
        ])

        return reaction[0].status

    }

    async findById(id: string) {
        return id
    }
}

