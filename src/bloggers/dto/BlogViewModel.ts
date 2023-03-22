import { IsDate, IsUUID } from "class-validator";
import { ImagesViewModel } from "./ImagesViewModel";

export class BlogViewModel {
  @IsUUID()
  id: string;

  name: string;

  description: string;

  websiteUrl: string;

  @IsDate()
  createdAt: Date;

  isMembership: boolean;

  images: ImagesViewModel;
}
