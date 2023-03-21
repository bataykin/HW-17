import { Module } from "@nestjs/common";
import { ImagesService } from "./images.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ImageEntity } from "./entities/ImageEntity";

@Module({
  imports: [
    TypeOrmModule.forFeature([ImageEntity]),

    // MulterModule.registerAsync({
    //   useFactory: () => ({
    //     dest: "./upload",
    //   }),
    // }),
  ],
  controllers: [],
  providers: [ImagesService],
})
export class ImagesModule {}
