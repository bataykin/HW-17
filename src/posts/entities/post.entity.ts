import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BlogEntity } from '../../bloggers/entities/blogEntity';
import { LikeEntity } from '../../likes/entities/like.entity';
import { CommentEntity } from '../../comments/entities/comment.entity';

@Entity({ name: 'posts' })
export class PostEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column()
  shortDescription: string;

  @Column({ type: 'varchar', length: 100 })
  content: string;

  @Column({ nullable: false })
  blogId: string;

  @Column({ nullable: false })
  blogName: string;

  @CreateDateColumn()
  // @Column({type:"timestamp"})
  createdAt: Date;

  // @Column({nullable: true})
  // extendedLikesInfo: number;

  @ManyToOne(() => BlogEntity, (blogger) => blogger.posts, {})
  @JoinColumn({ name: 'blogId', referencedColumnName: 'id' })
  blogger: BlogEntity;

  @OneToMany(() => LikeEntity, (l) => l.post)
  @JoinColumn({ referencedColumnName: 'postId' })
  likes: LikeEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.post)
  @JoinColumn({ referencedColumnName: 'postId' })
  comments: CommentEntity[];

  // toJSON() {
  //     return {...this, id:undefined}
  // }
  // @BeforeInsert()
  // createUuid(){
  //     this.test = uuid()
  // }
}
