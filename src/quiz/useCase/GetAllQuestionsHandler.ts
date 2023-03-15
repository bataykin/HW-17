import { QuestionsPaginationDTO } from "../dto/questionsPaginationDTO";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PaginatorModel } from "../../common/PaginatorModel";
import { QuestionsViewModel } from "../dto/QuestionsViewModel";
import { Inject } from "@nestjs/common";
import { IQuestionsRepo, IQuestionsRepoToken } from "../DAL/IQuestionsRepo";
import { QuestionEntity } from "../DAL/QuestionEntity";

export class GetAllQuestionsQuery {
  constructor(public readonly dto: QuestionsPaginationDTO) {}
}

@QueryHandler(GetAllQuestionsQuery)
export class GetAllQuestionsHandler
  implements IQueryHandler<GetAllQuestionsQuery>
{
  constructor(
    @Inject(IQuestionsRepoToken)
    private readonly questionsRepo: IQuestionsRepo<QuestionEntity>,
  ) {}
  async execute(
    query: GetAllQuestionsQuery,
  ): Promise<PaginatorModel<QuestionsViewModel[]>> {
    const { dto } = query;
    const questions = await this.questionsRepo.getAllQuestions(dto);
    const mappedQuestions = await this.questionsRepo.mapQuestionsToView(
      questions,
    );
    const docCount = await this.questionsRepo.countQuestions(dto);
    return {
      pagesCount: Math.ceil(docCount / dto.pageSize),
      page: dto.pageNumber,
      pageSize: dto.pageSize,
      totalCount: +docCount,
      items: mappedQuestions,
    };
  }
}
