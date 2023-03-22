import { IsDate, IsUUID } from "class-validator";
import { BlogImagesViewModel } from "./BlogImagesViewModel";

export class BlogViewModel {
  @IsUUID()
  id: string;

  name: string;

  description: string;

  websiteUrl: string;

  @IsDate()
  createdAt: Date;

  isMembership: boolean;

  images: BlogImagesViewModel;
}
