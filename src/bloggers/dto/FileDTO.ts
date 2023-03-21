import {
  ImageTargetEnum,
  ImageTypeEnum,
} from "../../images/entities/ImageEntity";
import { S3 } from "aws-sdk";
import sharp from "sharp";

export class FileDTO {
  target: ImageTargetEnum;
  fileName: string;
  fileSize: number;
  height: number;
  format: string;
  targetId: string;
  type: ImageTypeEnum;
  link: string;
  userId: string;
  width: number;
}

export const getFileImageDto = (
  type: ImageTypeEnum,
  target: ImageTargetEnum,
  targetId: string,
  s3file: S3.ManagedUpload.SendData,
  userId: string,
  metadata: sharp.Metadata,
): FileDTO => {
  return {
    type,
    target,
    targetId,
    fileName: s3file.Key,
    link: s3file.Location,
    format: metadata.format,
    userId,
    width: metadata.width,
    height: metadata.height,
    fileSize: metadata.size,
  };
};
