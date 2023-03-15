import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";
import { GameStatusEnum } from "../../dto/game/GameStatusEnum";

@Entity({ name: "games" })
export class GameEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ nullable: false })
  firstPlayerId: string;

  @Column({ nullable: true })
  secondPlayerId: string;

  @Column({ type: "text", nullable: true, array: true })
  questions: string[];

  @Column({ enum: GameStatusEnum, nullable: false })
  status: string;

  @CreateDateColumn()
  pairCreatedDate: Date;

  @Column({ type: "timestamptz", nullable: true })
  startGameDate: Date;

  @Column({ type: "timestamptz", nullable: true })
  finishGameDate: Date;

  // @ManyToOne(() => UserEntity, (user) => user.games)
  // user: UserEntity;
}
