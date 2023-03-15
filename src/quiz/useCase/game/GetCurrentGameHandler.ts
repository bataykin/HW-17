import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import {
  IQuestionsRepo,
  IQuestionsRepoToken,
} from "../../DAL/questions/IQuestionsRepo";
import { QuestionEntity } from "../../DAL/questions/QuestionEntity";

export class GetCurrentGameQuery {
  constructor(public readonly token: string) {}
}

@QueryHandler(GetCurrentGameQuery)
export class GetCurrentGameHandler
  implements IQueryHandler<GetCurrentGameQuery>
{
  constructor(
    @Inject(IQuestionsRepoToken)
    private readonly questionsRepo: IQuestionsRepo<QuestionEntity>,
  ) {}
  async execute(query: GetCurrentGameQuery): Promise<any> {
    const { token } = query;
  }
}
