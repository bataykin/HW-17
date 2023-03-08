import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type CommentDocument = Comment & Document

export enum LikeStatusEnum {
    None = "None",
    Like = "Like",
    Dislike = "Dislike"
}


export class LikesInfoCommentClass {
    //
    // @Prop()
    // id: string

    @Prop()
    likesCount: number
    //Total likes for parent item

    @Prop()
    dislikesCount: number
    //Total dislikes for parent item

    @Prop({type: LikeStatusEnum})
    myStatus: LikeStatusEnum
    //Send None if you want to unlike\undislike
}


@Schema({
    versionKey: false,
})
export class Comment {
    @Prop()
    content:	string

    @Prop()
    userId:	string

    @Prop()
    userLogin:	string

    @Prop({type: Date, default: Date.now})
    addedAt: Date

    @Prop({type: LikesInfoCommentClass})
    likesInfo: LikesInfoCommentClass


    @Prop()
    postId: string
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

