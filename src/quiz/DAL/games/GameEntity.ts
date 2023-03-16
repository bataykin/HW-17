import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";
import { GameStatusEnum } from "../../dto/game/GameStatusEnum";
import { QuestionEntity } from "../questions/QuestionEntity";

@Entity({ name: "games" })
export class GameEntity extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false })
  firstPlayerId: string;

  @Column({ nullable: true })
  secondPlayerId: string;

  @Column({ type: "json", nullable: true, array: true })
  questions: QuestionEntity[];

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

  @Column({ default: 0 })
  firstPlayerScore: number;

  @Column({ default: 0 })
  secondPlayerScore: number;

  @Column({ nullable: true })
  winner: string;
}
