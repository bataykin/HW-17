import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import {
  IQuestionsRepo,
  IQuestionsRepoToken,
} from "../../DAL/questions/IQuestionsRepo";
import { QuestionEntity } from "../../DAL/questions/QuestionEntity";

export class GetGameByIdQuery {
  constructor(public readonly gameId: string, public readonly token: string) {}
}

@QueryHandler(GetGameByIdQuery)
export class GetGameByIdHandler implements IQueryHandler<GetGameByIdQuery> {
  constructor(
    @Inject(IQuestionsRepoToken)
    private readonly questionsRepo: IQuestionsRepo<QuestionEntity>,
  ) {}
  async execute(query: GetGameByIdQuery): Promise<any> {
    const { token } = query;
  }
}
