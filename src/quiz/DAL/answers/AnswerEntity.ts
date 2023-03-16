import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { AnswerStatusEnum } from "../../dto/game/AnswerStatusEnum";

@Entity({ name: "answers" })
@Unique("UK_GAME_USER_QUESTION", ["gameId", "playerId", "questionId"])
export class AnswerEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ nullable: false })
  gameId: string;

  @Column({ nullable: false })
  playerId: string;

  @Column({ nullable: false })
  questionId: string;

  @Column({ nullable: true })
  answer: string;

  @Column({ enum: AnswerStatusEnum, nullable: false })
  answerStatus: string;

  @CreateDateColumn({ nullable: false })
  addedAt: Date;

  // @OneToOne(() => QuestionEntity, (questions) => questions.answer)
  // question: QuestionEntity;
}
