import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';
import {LikeStatusEnum} from "../comments/comment.schema";


export type PostDocument = Post & Document;

class LikeDetailsClass {
    @Prop({type: Date, default: Date.now})
    addedAt	: Date

    @Prop()
    userId:	string

    @Prop()
    login:	string
}

export class LikesInfoPostClass {
    @Prop()
    likesCount: number
    //Total likes for parent item

    @Prop()
    dislikesCount: number
    //Total dislikes for parent item

    @Prop()
    myStatus: LikeStatusEnum
    //Send None if you want to unlike\undislike

    @Prop({type: [LikeDetailsClass]})
    newestLikes: [LikeDetailsClass]
    //Last 3 likes (status "Like")
}
@Schema({
    versionKey: false,
})
export class Post {
    @Prop({type: String, required: true})
    title: string

    @Prop({type: String, required: true})
    shortDescription: string

    @Prop({type: String, required: true})
    content: string

    @Prop({type: String, required: true})
    bloggerId: string

    @Prop({type: String})
    bloggerName?: string

    @Prop({type: Date, /*default: Date.now*/})
    addedAt: Date

    @Prop()
    extendedLikesInfo: LikesInfoPostClass


}

export const PostSchema = SchemaFactory.createForClass(Post);

// PostSchema.virtual('id').get(function(){
//     return this._id.toHexString();
// });
//
// PostSchema.set('toJSON', {
//     virtuals: true,
//     versionKey:false,
//     transform: function (doc, ret) {   delete ret._id  }
// });