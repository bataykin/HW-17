import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import {
  ForbiddenException,
  Inject,
  UnauthorizedException,
} from "@nestjs/common";
import { UserEntity } from "../../users/entity/user.entity";
import { IBlogsRepo, IBlogsRepoToken } from "../DAL/IBlogsRepo";
import { BlogEntity } from "../entities/blogEntity";
import { AuthService } from "../../auth/authService";
import {
  IUsersQueryRepo,
  IUsersQueryRepoToken,
} from "../../users/DAL/IUserQueryRepo";
import { ImagesService } from "../../images/images.service";
import { Express } from "express";
import { getFileImageDto } from "../dto/FileDTO";
import {
  ImageTargetEnum,
  ImageTypeEnum,
} from "../../images/entities/ImageEntity";
import sharp from "sharp";
import { BlogImagesViewModel, ImageMetaView } from "../dto/BlogImagesViewModel";

// import sharp from "sharp";

export class UploadImageCommand {
  constructor(
    public readonly file: Express.Multer.File,
    public readonly blogId: string,
    public readonly accessToken: string,
  ) {}
}

@CommandHandler(UploadImageCommand)
export class UploadImageHandler implements ICommandHandler<UploadImageCommand> {
  constructor(
    private readonly authService: AuthService,
    @Inject(IUsersQueryRepoToken)
    private readonly usersQueryRepo: IUsersQueryRepo<UserEntity>,
    @Inject(IBlogsRepoToken)
    private readonly blogsRepo: IBlogsRepo<BlogEntity>,
    private readonly imagesService: ImagesService,
  ) {}

  async execute(command: UploadImageCommand): Promise<BlogImagesViewModel> {
    const { accessToken, file, blogId } = command;
    const retrievedUserFromToken = await this.authService.retrieveUser(
      accessToken,
    );
    const userIdFromToken = retrievedUserFromToken.userId;
    const user = await this.usersQueryRepo.findById(userIdFromToken);
    if (!user) {
      throw new UnauthorizedException("unexpected user");
    }

    const blog = await this.blogsRepo.findBlogById(blogId);
    if (!blog) throw new UnauthorizedException("no blog");
    if (blog.userId != user.id) throw new ForbiddenException("not your blog");

    const fittedBuffer = await sharp(file.buffer)
      .resize({ width: 997, height: 303 })
      .png({ quality: 80 })
      .toBuffer();

    const metadata = await sharp(fittedBuffer).metadata();

    // console.log(metadata);

    const s3file = await this.imagesService.uploadFile(
      fittedBuffer,
      file.originalname,
    );

    const fileMetaData = getFileImageDto(
      ImageTypeEnum.Wallpaper,
      ImageTargetEnum.Blog,
      blogId,
      s3file,
      user.id,
      metadata,
    );

    const savedImageData = await this.imagesService.saveMetaData(fileMetaData);
    const mainPics: ImageMetaView[] =
      await this.imagesService.getMainMetaDatasBlog(blogId);

    const res = {
      wallpaper: {
        url: s3file.Location,
        width: metadata.width,
        height: metadata.height,
        fileSize: metadata.size,
      },
      main: mainPics,
    };
    return res;
  }
}
