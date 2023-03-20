import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { GameStatusEnum } from "../../dto/game/GameStatusEnum";
import { QuestionEntity } from "../questions/QuestionEntity";
import { UserEntity } from "../../../users/entity/user.entity";

@Entity({ name: "games" })
export class GameEntity extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid", nullable: false })
  firstPlayerId: string;

  @Column({ type: "uuid", nullable: true })
  secondPlayerId: string;

  @Column({ type: "jsonb", nullable: true, array: true })
  questions: QuestionEntity[];

  @Column({ enum: GameStatusEnum, nullable: false })
  status: string;

  @CreateDateColumn()
  pairCreatedDate: Date;

  @Column({ type: "timestamptz", nullable: true })
  startGameDate: Date;

  @Column({ type: "timestamptz", nullable: true })
  finishGameDate: Date;

  @ManyToOne(() => UserEntity, (user) => user.games, { nullable: false })
  firstPlayer: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.games, { nullable: true })
  secondPlayer: UserEntity;

  @Column({ default: 0, nullable: true })
  firstPlayerScore: number;

  @Column({ default: 0, nullable: true })
  secondPlayerScore: number;

  @Column({ nullable: true })
  winner: string;

  @Column({ default: false })
  firstFinished: boolean;
}
