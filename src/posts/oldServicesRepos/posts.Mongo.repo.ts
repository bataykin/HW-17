import {Injectable, NotFoundException} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {FilterQuery, Model, UpdateQuery} from "mongoose";
import {Post, PostDocument} from "../post.schema";
import {CreatePostDto} from "../dto/create-post.dto";
import {UpdatePostDto} from "../dto/update-post.dto";
import {LikeStatusEnum} from "../../comments/comment.schema";
import {UsersMongoRepo} from "../../users/oldServiceRepos/users.Mongo.repo";

@Injectable()
export class PostsMongoRepo {
    constructor(
        @InjectModel(Post.name) private postModel: Model<PostDocument>,
        private readonly usersRepo: UsersMongoRepo
    ) {
    }


    async getAllPosts(skipSize: number, PageSize: number | 10) {
        const posts = await this.postModel.find({}).skip(skipSize).limit(PageSize).exec();

        let mappedPosts = posts.map((p) => {
            return {
                id: p._id,

                title: p.title,
                shortDescription: p.shortDescription,
                content: p.content,
                bloggerId: p.bloggerId,
                bloggerName: p.bloggerName,
                addedAt: p.addedAt,
                extendedLikesInfo: p.extendedLikesInfo
            }
        })

        return mappedPosts
    }


    async countDocuments(filter: FilterQuery<any>) {
        return this.postModel.countDocuments(filter);
        // return 1
    }

    async create(post: { addedAt: Date; bloggerName: string; shortDescription: string; title: string; content: string; bloggerId: string; extendedLikesInfo: { likesCount: number; newestLikes: any[]; dislikesCount: number; myStatus: string } }) {
        const newPost = await this.postModel.insertMany(post)

        // if (!newPost) {
        //     return  null
        // }
        //     const goodPost = newPost.map((p) => {
        //         let {_id, ...rest } = p
        //         return {
        //             id: _id,
        //             ...rest
        //         }
        //     })

        return newPost[0]._id

    }

    async isExists(dto: CreatePostDto) {
        // return this.postModel.findOne({$and: [{title: dto.title}, {bloggerId: dto.bloggerId}]});
        return false
    }

    async findById(id: string) {
        try {
            return this.postModel.findById(id).lean().then((res) => {
                if (!res) {
                    return res
                } else {
                    let {_id, ...rest} = res
                    return {
                        id: _id,
                        ...rest
                    }
                }

            })
        } catch (e) {
            throw new NotFoundException(e)
        }

    }

    async updatePost(id: string, dto: UpdatePostDto) {
        return this.postModel.findOneAndUpdate(
            {_id: id},
            {
                title: dto.title,
                shortDescription: dto.shortDescription,
                content: dto.content,
                bloggerId: dto.blogId
            },
            {new: true});
    }

    async deletePost(id: string) {
        return this.postModel.findByIdAndDelete(id)
    }

    async getPostByBloggerId(bloggerId: string, userId, skipSize: number, PageSize: number) {
        const posts = await this.postModel.find({bloggerId: bloggerId}).skip(skipSize).limit(PageSize).lean().exec();
        let res = []
        for (let i = 0; i < posts.length; i++) {
            let userReaction = await this.usersRepo.getUsersReactionOnPost(posts[i]._id, userId)
            let {_id, extendedLikesInfo, ...rest} = posts[i]
            extendedLikesInfo.myStatus = userReaction
            res.push({id: _id, extendedLikesInfo, ...rest})
        }
        return res
        // const mappedPosts = posts.map((p) => {
        // let {_id,...rest} = p
        //     return {id: _id, ...rest}
        // })
    }

    async getMyLikeInfo(userId: string, postId: string) {
        return this.postModel.findOne({$and: [{userId: userId}, {_id: postId}]}).select({_id: 0, extendedLikesInfo: 1})
    }

    async setLikeStatus(postId: string, updateQuery: UpdateQuery<any>) {
        return this.postModel.findByIdAndUpdate(postId, updateQuery, {new: true})
    }

    async updatePostWithLike(postId: string, totalLikes: number, totalDislikes: number, last3Likes: any, likeStatus: LikeStatusEnum) {
        return this.postModel.findByIdAndUpdate(postId,
            {
                'extendedLikesInfo.likesCount': totalLikes,
                'extendedLikesInfo.dislikesCount': totalDislikes,
                'extendedLikesInfo.myStatus': LikeStatusEnum.None,
                'extendedLikesInfo.newestLikes': last3Likes
            },
            {new: true})
    }

    async getAllPostsByAuthUser(userId: string, skipSize: number, PageSize: number | 10) {
        const posts = await this.postModel.find({}).skip(skipSize).limit(PageSize).exec();
        // console.log(posts)
        const mappedPosts = posts.map(async (p) => {
            let userReactionStatus: LikeStatusEnum = LikeStatusEnum.None
            userReactionStatus = await this.usersRepo.getUsersReactionOnPost(p._id, userId)
            // console.log('userReactionStatus', userReactionStatus)

            p.extendedLikesInfo.myStatus = userReactionStatus

            // console.log(p.extendedLikesInfo)
            const maPost = {
                id: p._id,
                title: p.title,
                shortDescription: p.shortDescription,
                content: p.content,
                bloggerId: p.bloggerId,
                bloggerName: p.bloggerName,
                addedAt: p.addedAt,
                extendedLikesInfo: p.extendedLikesInfo
            }
            // console.log(maPost)
            return maPost
        })

        return Promise.all(mappedPosts)

    }
}