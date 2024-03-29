import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { QuestionInputModel } from "../../dto/questions/QuestionInputModel";
import { Inject, NotFoundException } from "@nestjs/common";
import {
  IQuestionsRepo,
  IQuestionsRepoToken,
} from "../../DAL/questions/IQuestionsRepo";
import { QuestionEntity } from "../../DAL/questions/QuestionEntity";

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
    const question = await this.questionsRepo.getQuestionById(questionId);
    if (!question) throw new NotFoundException("net takogo id");
    await this.questionsRepo.updateQuestion(questionId, dto);
    return;
  }
}
