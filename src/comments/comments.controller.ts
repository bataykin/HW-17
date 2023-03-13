import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Put,
  Request,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { LikeStatusEnum } from "../likes/LikeStatusEnum";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { GetCommentByIdPublicQuery } from "./useCase/getCommentByIdHandlerPublic";
import { UpdateCommentCommand } from "./useCase/updateCommentCommand";
import { RemoveCommentCommand } from "./useCase/removeCommentHandler";
import { SetLikeStatusCommand } from "./useCase/setLikeStatusHandler";
import { ContentDto } from "./dto/contentDto";
import { SkipThrottle } from "@nestjs/throttler";

@SkipThrottle()
@Controller("comments")
export class CommentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  //  QUERY  Returns comment by Id
  //
  @Get(":id")
  async getCommentById(
    @Param("id", ParseUUIDPipe)
    commentId: string,
    @Request() req,
  ) {
    return this.queryBus.execute(new GetCommentByIdPublicQuery(commentId));
  }

  //  COMMAND  Update existing post by Id with InputModel
  //
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Put(":commentId")
  async updateComment(
    @Param("commentId", ParseUUIDPipe) commentId: string,
    @Body() content: ContentDto,
    @Request() req,
  ) {
    await this.getCommentById(commentId, req);
    const accessToken = req.headers.authorization?.split(" ")[1];
    return this.commandBus.execute(
      new UpdateCommentCommand(commentId, content.content, req.user),
    );
    // await this.commentsService.getCommentById(commentId)
    // if (req.headers.authorization) {
    //     const token = req.headers.authorization.split(' ')[1]
    //     const retrievedUserFromToken = await this.authService.retrieveUser(token)
    //     const userId = retrievedUserFromToken.sub
    //     return this.commentsService.updateCommentById(userId, commentId, content);
    // } else return this.commentsService.updateCommentById( commentId, content);
  }

  //  COMMAND  Delete comment specified by Id
  //
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Delete(":commentId")
  async removeComment(
    @Param("commentId", ParseUUIDPipe) commentId: string,
    @Request() req,
  ) {
    await this.getCommentById(commentId, req);
    const accessToken = req.headers.authorization?.split(" ")[1];
    return this.commandBus.execute(
      new RemoveCommentCommand(commentId, req.user),
    );
    // await this.commentsService.getCommentById(commentId)
    // if (req.headers.authorization) {
    //     const token = req.headers.authorization.split(' ')[1]
    //     const retrievedUserFromToken = await this.authService.retrieveUser(token)
    //     const userId = retrievedUserFromToken.sub
    //     return this.commentsService.removeCommentById( commentId, userId);
    // } else return this.commentsService.removeCommentById( commentId);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Put(":commentId/like-status")
  async makeSomeLike(
    @Param("commentId", ParseUUIDPipe) commentId: string,
    @Body(
      "likeStatus",
      new ParseEnumPipe(LikeStatusEnum, {
        errorHttpStatusCode: HttpStatus.BAD_REQUEST,
        exceptionFactory: (error) => {
          throw new BadRequestException({
            message: "likeStatus " + error,
            field: "likeStatus",
          });
        },
      }),
    )
    likeStatus: LikeStatusEnum,
    @Request() req,
  ) {
    await this.getCommentById(commentId, req);
    const accessToken = req.headers.authorization?.split(" ")[1];
    return await this.commandBus.execute(
      new SetLikeStatusCommand(commentId, likeStatus, accessToken),
    );
    // await this.commentsService.getCommentById(commentId)
    // const token = req.headers.authorization.split(' ')[1]
    // const retrievedUserFromToken = await this.authService.retrieveUser(token)
    // const userId = retrievedUserFromToken.sub
    // return this.commentsService.setLikeStatus(userId, commentId, likeStatus)
  }
}
