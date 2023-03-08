import { LikeStatusEnum } from "../../likes/LikeStatusEnum";
import { IsEnum } from "class-validator";

export class SetLikeDto {
  @IsEnum(LikeStatusEnum)
  likeStatus: LikeStatusEnum;
}
