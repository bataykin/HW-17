import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BlogEntity } from "./blogEntity";
import { UserEntity } from "../../users/entity/user.entity";

@Entity({ name: "banned_users" })
export class BannedUsersEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("uuid")
  userId!: string;

  @Column()
  login!: string;

  @Column("uuid")
  blogId!: string;

  @Column({ default: false })
  isBanned: boolean;

  @Column({ nullable: true })
  banReason: string;

  @Column({ type: "timestamptz", nullable: true })
  banDate: Date;

  @ManyToOne(() => BlogEntity, (blog) => blog.bannedUsers)
  blog: BlogEntity;

  @ManyToOne(() => UserEntity, (user) => user.bannedUsers)
  user: UserEntity;
}
