import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { QuestionsViewModel } from "../dto/QuestionsViewModel";
import { QuestionInputModel } from "../dto/QuestionInputModel";
import { Inject } from "@nestjs/common";
import { IQuestionsRepo, IQuestionsRepoToken } from "../DAL/IQuestionsRepo";
import { QuestionEntity } from "../DAL/QuestionEntity";

export class CreateQuestionCommand {
  constructor(public readonly dto: QuestionInputModel) {}
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionsHandler
  implements ICommandHandler<CreateQuestionCommand>
{
  constructor(
    @Inject(IQuestionsRepoToken)
    private readonly questionsRepo: IQuestionsRepo<QuestionEntity>,
  ) {}

  async execute(command: CreateQuestionCommand): Promise<QuestionsViewModel> {
    const { dto } = command;
    const question = await this.questionsRepo.createQuestion(dto);
    const mappedQuestion = await this.questionsRepo.mapQuestionToView(question);
    return mappedQuestion;
  }
}
