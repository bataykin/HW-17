import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export enum ImageTypeEnum {
  Main = "main",
  Wallpaper = "wallpaper",
}

export enum ImageTargetEnum {
  Blog = "blog",
  Post = "post",
}

@Entity({ name: "images" })
export class ImageEntity extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  imageId: string;

  @Column({ type: "enum", enum: ImageTypeEnum })
  type: ImageTypeEnum;

  @Column({ type: "enum", enum: ImageTargetEnum })
  target: ImageTargetEnum;

  @Column("uuid")
  targetId: string;

  @Column()
  fileName: string;

  @Column()
  link: string;

  @Column()
  format: string;

  @Column("uuid")
  userId: string;

  @Column()
  width: number;

  @Column()
  height: number;

  @Column()
  fileSize: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
