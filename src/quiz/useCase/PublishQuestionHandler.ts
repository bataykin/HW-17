import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { QuestionPublishInputModel } from "../dto/QuestionPublishInputModel";
import { Inject, NotFoundException } from "@nestjs/common";
import { IQuestionsRepo, IQuestionsRepoToken } from "../DAL/IQuestionsRepo";
import { QuestionEntity } from "../DAL/QuestionEntity";

export class PublishQuestionCommand {
  constructor(
    public readonly questionId: string,
    public readonly dto: QuestionPublishInputModel,
  ) {}
}

@CommandHandler(PublishQuestionCommand)
export class PublishQuestionHandler
  implements ICommandHandler<PublishQuestionCommand>
{
  constructor(
    @Inject(IQuestionsRepoToken)
    private readonly questionsRepo: IQuestionsRepo<QuestionEntity>,
  ) {}

  async execute(command: PublishQuestionCommand): Promise<void> {
    const { questionId, dto } = command;
    const question = await this.questionsRepo.getQuestionById(questionId);
    if (!question) throw new NotFoundException("net takogo id");
    await this.questionsRepo.publishQuestion(questionId, dto);
    return;
  }
}
