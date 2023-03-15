import { IsUUID } from "class-validator";

export class QuestionsViewModel {
  @IsUUID()
  id: string;
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(dto: QuestionsViewModel) {
    this.id = dto.id ?? null;
    this.body = dto.body ?? null;
    this.correctAnswers = dto.correctAnswers ?? null;
    this.published = dto.published ?? false;
    this.createdAt = dto.createdAt ?? null;
    this.updatedAt = dto.createdAt ?? null;
  }
}
