import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {ForbiddenException, Inject, NotFoundException} from "@nestjs/common";
import {ICommentsRepo, ICommentsRepoToken} from "../ICommentsRepo";
import {CommentEntity} from "../entities/comment.entity";
import {UserEntity} from "../../users/entity/user.entity";

export class RemoveCommentCommand {
    constructor(public readonly commentId: string,
                public readonly user: any) {
    }
}

@CommandHandler(RemoveCommentCommand)
export class RemoveCommentHandler implements ICommandHandler<RemoveCommentCommand> {
    constructor(@Inject(ICommentsRepoToken)
                private readonly commentsRepo: ICommentsRepo<CommentEntity>) {
    }

    async execute(command: RemoveCommentCommand): Promise<any> {
        const {commentId, user} = command
        const comment = await this.commentsRepo.findCommentById(commentId)
        if (!comment) {
            throw new NotFoundException('net takogo comment id')
        }
        if (comment.userId !== user.userId) {
            throw new ForbiddenException('try to update or delete the entity that was created by another user')
        }
        await this.commentsRepo.deleteComment(commentId)
        return Promise.resolve(undefined);
    }

}