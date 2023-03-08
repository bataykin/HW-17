import { IsString } from "class-validator";

export class CreatePostByBloggerDto {
    @IsString()
    title: string

    @IsString()
    shortDescription: string

    @IsString()
    content: string



}
