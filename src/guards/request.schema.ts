import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';


export type RequestDocument = Request & Document;


@Schema({
    versionKey: false,
    // timestamps: {createdAt:true, updatedAt: false},
})
export class Request{
    @Prop()
    ip: string

    @Prop()
    requestDate: Date

    @Prop()
    endpoint: string

    @Prop()
    login?: string

}

export const RequestSchema = SchemaFactory.createForClass(Request);

