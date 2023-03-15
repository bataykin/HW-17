import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { QuestionInputModel } from "../dto/QuestionInputModel";
import { Inject } from "@nestjs/common";
import { IQuestionsRepo, IQuestionsRepoToken } from "../DAL/IQuestionsRepo";
import { QuestionEntity } from "../DAL/QuestionEntity";

export class UpdateQuestionCommand {
  constructor(
    public readonly questionId: string,
    public readonly dto: QuestionInputModel,
  ) {}
}

@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionHandler
  implements ICommandHandler<UpdateQuestionCommand>
{
  constructor(
    @Inject(IQuestionsRepoToken)
    private readonly questionsRepo: IQuestionsRepo<QuestionEntity>,
  ) {}

  async execute(command: UpdateQuestionCommand): Promise<void> {
    const { questionId, dto } = command;
    await this.questionsRepo.updateQuestion(questionId, dto);
    return;
  }
}
