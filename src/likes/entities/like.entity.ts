import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import { PostEntity } from "../../posts/entities/post.entity";
import { CommentEntity } from "../../comments/entities/comment.entity";
import { UserEntity } from "../../users/entity/user.entity";

@Entity({ name: "likes" })
@Unique("pk_likes_user_post", ["userId", "postId"])
@Unique("pl_likes_user_comment", ["userId", "commentId"])
export class LikeEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true })
  postId: string;

  @Column({ nullable: true })
  commentId: string;

  @Column()
  userId: string;

  @Column({ default: "None" })
  reaction: string;

  @CreateDateColumn()
  addedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // @Column({
  //     type: "json",
  //     default: {likesCount: 0, dislikesCount: 0, myStatus: LikeStatusEnum.None}
  // })
  // likesInfo: JSON

  @ManyToOne(() => PostEntity, (p) => p.likes)
  post: PostEntity;

  @ManyToOne(() => CommentEntity, (c) => c.likes)
  comment: CommentEntity;

  @ManyToOne(() => UserEntity, (u) => u.likes)
  user: UserEntity;
}
