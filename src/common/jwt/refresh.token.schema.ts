import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RefreshTokenDocument = RefreshToken & Document;

@Schema({
  versionKey: false,
  // timestamps: {createdAt:true, updatedAt: false},
})
export class RefreshToken {
  @Prop()
  token: string;

  @Prop()
  isValid: boolean;

  @Prop()
  replacedBy: string;

  @Prop()
  expiresAt: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
