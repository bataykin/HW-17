import {BadRequestException, ForbiddenException, NotFoundException} from "@nestjs/common";
import {LikeStatusEnum} from "../comment.schema";

export interface ICommentService {
    getCommentsByPost(postId: string, PageSize: number, PageNumber: number): any,

// from posts route
    createCommentByPost(login: string, userId: string, postId: string, content: string): any,


    getCommentById(id: string, userId?: string): any,


    updateCommentById(userId: string, commentId: string, content: string): any,


    removeCommentById(userId: string, commentId: string): any,


    setLikeStatus(userId: string, commentId: string, likeStatus: LikeStatusEnum): any,

    findCommentByIdOnUserId(commentId: string, userId: any): any,


    getCommentsByPostAuthUser(postId: string, userId: string, PageSize: number | 10, PageNumber: number | 1): any,
}

export const ICommentServiceToken = Symbol("ICommentService");

export abstract class ACommentService {
   abstract getCommentsByPost(postId: string, PageSize: number, PageNumber: number, userId?: string): any;

// from posts route
   abstract createCommentByPost(login: string, userId: string, postId: string, content: string): any;

   abstract getCommentById(id: string, userId?: string): any;

   abstract updateCommentById(commentId: string, content: string, userId?: string): any;

   abstract removeCommentById( commentId: string, userId?: string): any;

   abstract setLikeStatus(userId: string, commentId: string, likeStatus: LikeStatusEnum): any;

   abstract findCommentByIdOnUserId(commentId: string, userId: any): any;

   abstract getCommentsByPostAuthUser(postId: string, userId: string, PageSize: number | 10, PageNumber: number | 1): any;
}