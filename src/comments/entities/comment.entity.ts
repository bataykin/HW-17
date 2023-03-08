import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { LikeEntity } from "../../likes/entities/like.entity";
import { UserEntity } from "../../users/entity/user.entity";
import { PostEntity } from "../../posts/entities/post.entity";

@Entity('comments')
export class CommentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column()
  userId: string;

  @Column()
  userLogin: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  postId: string;

  // @Column()
  // likesCount: number
  //
  // @Column()
  // dislikesCount: number
  //
  // @Column({type: "enum", enum: LikeStatusEnum, default: LikeStatusEnum.None})
  // myStatus: string

  // @Column({nullable: true})
  // "likesInfo": number;

  @OneToMany(() => LikeEntity, (l) => l.comment)
  likes: LikeEntity[];

  @ManyToOne((u) => UserEntity, (u) => u.comments)
  user: UserEntity;

  @ManyToOne((post) => PostEntity, (post) => post.comments)
  post: PostEntity;
}
