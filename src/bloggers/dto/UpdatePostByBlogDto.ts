import {IsBlogExist} from "../decorators/isBloggerExistsDecorator";
import {IsNotEmpty, IsString, IsUUID, MaxLength} from "class-validator";

export class UpdatePostByBlogDto {
    // POST_ID ???
    // @IsUUID()
    // id: string

    @IsNotEmpty()
    @IsString()
    @MaxLength(30)
    title: string

    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    shortDescription: string

    @IsNotEmpty()
    @IsString()
    @MaxLength(1000)
    content: string

    // @IsBlogExist('blogId')
    @IsUUID()
    blogId: string
    //
    // @IsNotEmpty()
    // @IsString()
    // blogName: string
}