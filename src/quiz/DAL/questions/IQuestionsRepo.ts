import { QuestionInputModel } from "../../dto/questions/QuestionInputModel";
import { QuestionPublishInputModel } from "../../dto/questions/QuestionPublishInputModel";
import { QuestionsPaginationDTO } from "../../dto/questions/questionsPaginationDTO";
import { QuestionsViewModel } from "../../dto/questions/QuestionsViewModel";

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

  getQuestionById(questionId: string): Promise<GenericQuestionType>;
}
