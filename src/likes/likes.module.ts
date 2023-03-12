import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LikeEntity } from "./entities/like.entity";
import { ILikesRepoToken } from "./DAL/ILikesRepo";
import { LikesSQLRepo } from "./DAL/likes.SQL.repo";

@Module({
  imports: [TypeOrmModule.forFeature([LikeEntity])],

  controllers: [],

  providers: [
    {
      provide: ILikesRepoToken,
      useClass: LikesSQLRepo,
    },
  ],

  exports: [],
})
export class LikesModule {}
