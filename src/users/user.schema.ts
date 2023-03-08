import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { LikeStatusEnum } from "../comments/comment.schema";

export type UserDocument = User & Document;

class SentConfirmationEmailTypeSchema {
  @Prop()
  sentDate: Date;
}

class EmailConfirmationTypeSchema {
  @Prop()
  isConfirmed: boolean;

  @Prop()
  confirmationCode: string;

  @Prop()
  expirationDate: Date;

  @Prop({ type: [SentConfirmationEmailTypeSchema] })
  sentEmails: SentConfirmationEmailTypeSchema[];
}
class UserAccountTypeSchema {
  @Prop({ type: String, unique: true })
  email: string;

  @Prop({ type: String, unique: true })
  login: string;

  @Prop({ type: String, required: true })
  passwordHash: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

@Schema({ _id: false })
class LikesOnPosts {
  @Prop({ type: String })
  postId: string;

  @Prop({ type: String, enum: LikeStatusEnum })
  status: LikeStatusEnum;

  @Prop({ type: Date, default: Date.now })
  modifiedAt: Date;
}

@Schema({ _id: false })
class LikesOnComments {
  @Prop({ type: String })
  commentId: string;

  @Prop({ enum: LikeStatusEnum })
  status: LikeStatusEnum;

  @Prop({ type: Date, default: Date.now })
  modifiedAt: Date;
}

@Schema({
  versionKey: false,
  // timestamps: {createdAt:true, updatedAt: false},
})
export class User {
  @Prop({ type: UserAccountTypeSchema })
  accountData: UserAccountTypeSchema;

  @Prop({ type: EmailConfirmationTypeSchema })
  emailConfirmation: EmailConfirmationTypeSchema;

  @Prop([LikesOnPosts])
  reactedPosts: LikesOnPosts[];

  @Prop([LikesOnComments])
  reactedComments: LikesOnComments[];
}

export const UserSchema = SchemaFactory.createForClass(User);

// UserSchema.index({ yeti: 1, firstName: 1 }, { unique: true });
