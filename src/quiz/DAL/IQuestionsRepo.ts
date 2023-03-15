import { QuestionInputModel } from "../dto/QuestionInputModel";
import { QuestionPublishInputModel } from "../dto/QuestionPublishInputModel";
import { QuestionsPaginationDTO } from "../dto/questionsPaginationDTO";
import { QuestionsViewModel } from "../dto/QuestionsViewModel";

export const IQuestionsRepoToken = Symbol("IQuestionsRepoToken");
export interface IQuestionsRepo<GenericQuestionType> {
  getAllQuestions(dto: QuestionsPaginationDTO): Promise<GenericQuestionType[]>;

  createQuestion(dto: QuestionInputModel): Promise<GenericQuestionType>;

  updateQuestion(questionId: string, dto: QuestionInputModel): Promise<void>;

  deleteQuestion(questionId: string): Promise<void>;

  publishQuestion(
    questionId: string,
    dto: QuestionPublishInputModel,
  ): Promise<void>;

  ////////////////////

  mapQuestionToView(question: GenericQuestionType): Promise<QuestionsViewModel>;

  mapQuestionsToView(
    questions: GenericQuestionType[],
  ): Promise<QuestionsViewModel[]>;

  countQuestions(dto: QuestionsPaginationDTO): Promise<number>;
}
