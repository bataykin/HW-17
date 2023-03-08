import { Module } from "@nestjs/common";
import { LikesSQLService } from "./oldServiceRepos/likes.SQL.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LikesORMService } from "./oldServiceRepos/likes.ORM.service";
import { LikeEntity } from "./entities/like.entity";
import { ILikesRepoToken } from "./ILikesRepo";
import { useRepositoryClassGeneric } from "../common/useRepositoryClassGeneric";
import { LikesORM } from "./likesORM";

const useLikeServiceClass = () => {
  if (process.env.REPO_TYPE === "MONGO") {
    return null;
  } else if (process.env.REPO_TYPE === "SQL") {
    return LikesSQLService;
  } else if (process.env.REPO_TYPE === "ORM") {
    return LikesORMService;
  } else return null; // by DEFAULT if not in enum
};

@Module({
  imports: [TypeOrmModule.forFeature([LikeEntity])],

  controllers: [],

  providers: [
    {
      provide: ILikesRepoToken,
      useClass: useRepositoryClassGeneric(LikesORM, LikesORM, LikesORM),
    },
    // {
    //     provide: ALikeService,
    //     useClass: useLikeServiceClass()
    // },
    //
    // LikesORMService,
    // LikesORMRepo,
    //
    // LikesSQLService,
    // LikesSQLRepo
  ],

  exports: [
    // LikesSQLService,
    // LikesSQLRepo,
    //
    // LikesORMService,
    // LikesORMRepo,
  ],
})
export class LikesModule {}
