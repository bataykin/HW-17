import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity({ name: "questions" })
export class QuestionEntity extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar" })
  body: string;

  @Column({ type: "varchar", array: true })
  correctAnswers: string[];

  @Column({ type: "boolean", default: false })
  published: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: "timestamptz", nullable: true, default: null })
  updatedAt: Date;

  // @OneToOne(() => AnswerEntity, (answer) => answer.question)
  // answer: AnswerEntity;
}
