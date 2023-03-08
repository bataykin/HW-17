import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PostEntity } from "../../posts/entities/post.entity";
import { UserEntity } from "../../users/entity/user.entity";
import { BannedUsersEntity } from "./bannedUsersEntity";

@Entity({ name: 'blogs' })
export class BlogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  websiteUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  isMembership: boolean;

  //additional fields

  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @Column({ default: false })
  isBanned: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  banDate: Date;

  //relations

  @ManyToOne(() => UserEntity, (user) => user.blogs)
  user: UserEntity;

  @OneToMany(() => PostEntity, (post) => post.blogger)
  @JoinColumn({ referencedColumnName: 'blogId' })
  posts: PostEntity[];

  @OneToMany(() => BannedUsersEntity, (bannedUser) => bannedUser.blog)
  @JoinColumn({ referencedColumnName: 'blogId' })
  bannedUsers: BannedUsersEntity[];

  // @AfterInsert()
  // @AfterUpdate()
  // get blogOwnerInfo(): any {
  //     console.log('blogOwnerInfo ', this.user)
  //     return {
  //         userId: this.user?.id,
  //         userLogin: this.user?.login
  //     }
  // }
}
