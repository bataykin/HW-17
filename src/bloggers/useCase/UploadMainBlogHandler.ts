import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  NotFoundException,
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
import { ImagesViewModel } from "../dto/ImagesViewModel";

// import sharp from "sharp";

export class UploadMainBlogCommand {
  constructor(
    public readonly file: Express.Multer.File,
    public readonly blogId: string,
    public readonly accessToken: string,
  ) {}
}

@CommandHandler(UploadMainBlogCommand)
export class UploadMainBlogHandler
  implements ICommandHandler<UploadMainBlogCommand>
{
  constructor(
    private readonly authService: AuthService,
    @Inject(IUsersQueryRepoToken)
    private readonly usersQueryRepo: IUsersQueryRepo<UserEntity>,
    @Inject(IBlogsRepoToken)
    private readonly blogsRepo: IBlogsRepo<BlogEntity>,
    private readonly imagesService: ImagesService,
  ) {}

  async execute(command: UploadMainBlogCommand): Promise<ImagesViewModel> {
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
    if (!blog) throw new NotFoundException("no blog");
    if (blog.userId != user.id) throw new ForbiddenException("not your blog");

    const origMeta = await sharp(file.buffer).metadata();
    if (origMeta.height > 156 || origMeta.width > 156)
      throw new BadRequestException(
        `too large for main img, received ${file.mimetype} : ${origMeta.width} * ${origMeta.height}`,
      );
    if (!["image/jpeg", "image/x-png", "image/png"].includes(file.mimetype))
      throw new BadRequestException(
        `imgs only, received ${file.mimetype} : ${origMeta.width} * ${origMeta.height}`,
      );

    const fittedBuffer = await sharp(file.buffer)
      .resize({ width: 156, height: 156 })
      // .png({ quality: 80 })
      .toBuffer();

    const metadata = await sharp(fittedBuffer).metadata();

    const s3file = await this.imagesService.uploadFile(
      fittedBuffer,
      file.originalname,
    );

    const fileMetaData = getFileImageDto(
      ImageTypeEnum.Main,
      ImageTargetEnum.Blog,
      blogId,
      s3file,
      user.id,
      metadata,
    );

    await this.imagesService.saveMetaData(fileMetaData);

    const imgs = this.blogsRepo.mapImagesToBlog(blog);

    return imgs;
  }
}
