import {LikeStatusEnum} from "../comment.schema";
import {IsEnum} from "class-validator";

export class SetLikeDto {
    @IsEnum(LikeStatusEnum)
    likeStatus: LikeStatusEnum
}