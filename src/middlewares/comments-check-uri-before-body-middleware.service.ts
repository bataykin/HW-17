import { Injectable, NestMiddleware, NotFoundException } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

@Injectable()
export class CommentsCheckUriBeforeBodyMiddleware implements NestMiddleware {

    constructor() {
    }

    async use(req: Request, res: Response, next: NextFunction) {
        const fullUrl = req.baseUrl + req.path
        const restUrl = fullUrl.split('/')
        if ((restUrl[1] === 'comments') && (restUrl[3] === 'like-status')) {
            if (!mongoose.Types.ObjectId.isValid(restUrl[2]) && (typeof restUrl[2] != "string")) {
                throw new NotFoundException('net takogo comments')
            }

        }


        next();
    }
}

