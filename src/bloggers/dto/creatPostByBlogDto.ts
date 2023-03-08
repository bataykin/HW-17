import { OmitType } from "@nestjs/mapped-types";
import { CreatePostDto } from "../../posts/dto/create-post.dto";

export class CreatPostByBlogDto extends OmitType(CreatePostDto, ['blogId']){}