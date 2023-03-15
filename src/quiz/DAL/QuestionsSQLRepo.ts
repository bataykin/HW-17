import { IQuestionsRepo } from "./IQuestionsRepo";
import { QuestionsPaginationDTO } from "../dto/questionsPaginationDTO";
import { QuestionPublishInputModel } from "../dto/QuestionPublishInputModel";
import { QuestionInputModel } from "../dto/QuestionInputModel";
import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { QuestionEntity } from "./QuestionEntity";
import { QuestionsViewModel } from "../dto/QuestionsViewModel";

@Injectable()
export class QuestionsSQLRepo implements IQuestionsRepo<QuestionEntity> {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async createQuestion(dto: QuestionInputModel): Promise<QuestionEntity> {
    const question = await this.dataSource.query(
      `
    insert into questions (body, "correctAnswers")
    values( $1, $2)
    returning *
    `,
      [dto.body, dto.correctAnswers],
    );
    return question[0] ?? question;
  }

  async deleteQuestion(questionId: string): Promise<void> {
    await this.dataSource.query(
      `
      delete from questions 
      where id = $1
    `,
      [questionId],
    );
    return;
  }

  async getAllQuestions(
    dto: QuestionsPaginationDTO,
  ): Promise<QuestionEntity[]> {
    const questions = await this.dataSource.query(
      `
      select * from questions
   where 
    case when $3::text is null then true
    else (upper(body) ~ $3::text) end
    order by "${dto.sortBy}" ${dto.sortDirection}
    limit $1 offset $2 
   `,
      [dto.pageSize, dto.skipSize, dto.bodySearchTerm],
    );
    return questions;
  }

  async publishQuestion(
    questionId: string,
    dto: QuestionPublishInputModel,
  ): Promise<void> {
    await this.dataSource.query(
      `
    update questions
    set published = $1,"updatedAt" = $2
    where id = $3
    `,
      [dto.published, new Date(), questionId],
    );
    return;
  }

  async updateQuestion(
    questionId: string,
    dto: QuestionInputModel,
  ): Promise<void> {
    await this.dataSource.query(
      `
    update questions
    set body = $1, "correctAnswers" = $2, "updatedAt" = $3
    where id = $4
    `,
      [dto.body, dto.correctAnswers, new Date(), questionId],
    );
    return;
  }

  async mapQuestionToView(
    question: QuestionEntity,
  ): Promise<QuestionsViewModel> {
    return question;
  }

  async mapQuestionsToView(
    questions: QuestionEntity[],
  ): Promise<QuestionsViewModel[]> {
    const mappedQuestions: QuestionsViewModel[] = [];
    for await (const question of questions) {
      mappedQuestions.push(await this.mapQuestionToView(question));
    }
    return mappedQuestions ?? null;
  }

  async countQuestions(dto: QuestionsPaginationDTO): Promise<number> {
    const count = await this.dataSource.query(
      `
    select * from questions
   where 
    case when $1::text is null then true
    else (upper(body) ~ $1::text) end
    `,
      [dto.bodySearchTerm],
    );
    return count.length ?? 0;
  }

  async getQuestionById(questionId: string): Promise<QuestionEntity> {
    const question = await this.dataSource.query(
      `
    select * from questions
    where id = $1
    `,
      [questionId],
    );
    return question[0] ?? null;
  }
}
