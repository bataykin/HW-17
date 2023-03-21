import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ImageEntity, ImageTypeEnum } from "./entities/ImageEntity";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { v4 as uuid } from "uuid";
import { S3 } from "aws-sdk";
import { FileDTO } from "../bloggers/dto/FileDTO";
import { ImageMetaView } from "../bloggers/dto/BlogImagesViewModel";

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(ImageEntity)
    private imagesRepo: Repository<ImageEntity>,
    private readonly configService: ConfigService,
  ) {}

  async uploadFile(
    dataBuffer: Buffer,
    filename: string,
  ): Promise<S3.ManagedUpload.SendData> {
    const s3 = new S3();
    return await s3
      .upload({
        Bucket: this.configService.get("AWS_PUBLIC_BUCKET_NAME"),
        Body: dataBuffer,
        Key: `${uuid()}-${filename}`,
      })
      .promise();
  }

  async saveMetaData(data: FileDTO) {
    await this.imagesRepo.save(data);
  }

  async getMainMetaDatasBlog(blogId: string): Promise<ImageMetaView[]> {
    let mapped = [];
    const mainPics = await this.imagesRepo.find({
      select: ["link", "width", "height", "fileSize"],
      where: { targetId: blogId, type: ImageTypeEnum.Main },
    });
    mapped = mainPics.map((p) => {
      return {
        url: p.link,
        width: p.width,
        height: p.height,
        fileSize: p.fileSize,
      };
    });

    return mapped;
  }
}
