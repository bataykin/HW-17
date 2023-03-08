import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CommentEntity } from "../entities/comment.entity";
import { Injectable } from "@nestjs/common";
import { PostEntity } from "../../posts/entities/post.entity";

@Injectable()
export class CommentsORMRepo extends Repository<PostEntity> {
    constructor(@InjectRepository(CommentEntity)
                private readonly commentsRepository: Repository<CommentEntity>,
    ) {
        super(CommentEntity, commentsRepository.manager, commentsRepository.queryRunner)
    }

    async createComment(comment: {
        userLogin: string; addedAt: Date; postId: string; userId: string; content: string;
        likesInfo: { likesCount: number; dislikesCount: number; myStatus: string }
    }) {
        const res = await this.commentsRepository.create({
            content: comment.content,
            userId: comment.userId,
            userLogin: comment.userLogin,
            postId: comment.postId
        })
        return res
    }

    async findById(commentId: string) {
        return await this.commentsRepository.findOneBy({id: commentId})
    }

    async getCommentsByPost(postId: string, skipSize: number, PageSize: number) {
        const result = await this.commentsRepository.find({
            where: {postId: postId},
            skip: skipSize,
            take: PageSize
        })
        return result
    }

    async updateComment(commentId: string, content: string) {
        return await this.commentsRepository.update(
            {id: commentId},
            {content: content}
        )

    }

    async deleteComment(commentId: string) {
        return await this.commentsRepository.delete({id:commentId})
    }
}