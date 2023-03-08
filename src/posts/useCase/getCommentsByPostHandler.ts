import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { PaginationPostsDto } from "../dto/pagination.posts.dto";
import { ICommentsRepo, ICommentsRepoToken } from "../../comments/ICommentsRepo";
import { CommentEntity } from "../../comments/entities/comment.entity";
import { ExtractJwt } from "passport-jwt";
import { AuthService } from "../../auth/authService";
import { ILikesRepo, ILikesRepoToken } from "../../likes/ILikesRepo";
import { LikeEntity } from "../../likes/entities/like.entity";

export class GetCommentsByPostCommand {
    constructor(public readonly postId: string,
                public readonly dto: PaginationPostsDto,
                public readonly accessToken: string) {
    }
}

@QueryHandler(GetCommentsByPostCommand)
export class GetCommentsByPostHandler implements IQueryHandler<GetCommentsByPostCommand> {
    constructor(@Inject(ICommentsRepoToken)
                private readonly commentsRepo: ICommentsRepo<CommentEntity>,
                @Inject(ILikesRepoToken)
                private readonly likesRepo: ILikesRepo<LikeEntity>,
                /* @Inject(IPostsRepoToken)
                 private readonly postsRepo: IPostsRepo<PostEntity>*/
                private readonly authService: AuthService) {
    }

    async execute(query: GetCommentsByPostCommand): Promise<any> {
        const {postId, dto, accessToken} = query
        // console.log(accessToken)
        const retrievedUserFromToken =
            (accessToken) ? await this.authService.retrieveUser(accessToken) : undefined
        const userIdFromToken = (retrievedUserFromToken) ? retrievedUserFromToken.userId : undefined
        const {

            pageNumber = 1,
            pageSize = 10,
            sortBy = 'createdAt',
            sortDirection = 'desc',
            skipSize = (+pageNumber > 1) ? (+pageSize * (+pageNumber - 1)) : 0
        }
            = dto
        const commentsPaginationBLLdto = {
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            skipSize
        }
        const comments = await this.commentsRepo.getCommentsByPost(postId, commentsPaginationBLLdto)
        const mappedComments = await  this.likesRepo.mapArrayCommentEntitiesToResponse(comments, userIdFromToken)
        const docCount = await this.commentsRepo.countComments(postId)
        const result = {
            "pagesCount": Math.ceil(docCount / pageSize),
            "page": pageNumber,
            "pageSize": pageSize,
            "totalCount": docCount,
            "items": mappedComments
        }
        return Promise.resolve(result);
    }


}