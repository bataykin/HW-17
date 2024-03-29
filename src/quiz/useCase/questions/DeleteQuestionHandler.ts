import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject, NotFoundException } from "@nestjs/common";
import {
  IQuestionsRepo,
  IQuestionsRepoToken,
} from "../../DAL/questions/IQuestionsRepo";
import { QuestionEntity } from "../../DAL/questions/QuestionEntity";

export class DeleteQuestionCommand {
  constructor(public readonly questionId: string) {}
}

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionHandler
  implements ICommandHandler<DeleteQuestionCommand>
{
  constructor(
    @Inject(IQuestionsRepoToken)
    private readonly questionsRepo: IQuestionsRepo<QuestionEntity>,
  ) {}

  async execute(command: DeleteQuestionCommand): Promise<void> {
    const { questionId } = command;
    const question = await this.questionsRepo.getQuestionById(questionId);
    if (!question) throw new NotFoundException("net takogo id");
    await this.questionsRepo.deleteQuestion(questionId);
    return;
  }
}
