import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type BloggerDocument = Blogger & Document;

@Schema({
  versionKey: false,
})
export class Blogger {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  websiteUrl: string;
}

export const BloggerSchema = SchemaFactory.createForClass(Blogger);
