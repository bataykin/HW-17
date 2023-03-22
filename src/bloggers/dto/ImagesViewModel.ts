export class ImagesViewModel {
  wallpaper: ImageMetaView;
  main: ImageMetaView[];
}

export class ImageMetaView {
  url: string;
  width: number;
  height: number;
  fileSize: number;
}
