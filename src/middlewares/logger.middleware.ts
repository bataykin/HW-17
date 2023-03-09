import {
  HttpException,
  Inject,
  Injectable,
  NestMiddleware,
} from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { IRequestRepo, IRequestRepoToken } from "../auth/IRequestRepo";
import { RequestEntity } from "../auth/entities/request.entity";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(
    @Inject(IRequestRepoToken)
    private readonly requestsRepo: IRequestRepo<RequestEntity>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    const parseIp = (req) =>
      req.headers["x-forwarded-for"]?.split(",").shift() ||
      req.socket?.remoteAddress;
    // console.log(parseIp(req))
    const trueDate = new Date();
    const fullUrl = req.baseUrl + req.path;
    const attemptsCount: number = await this.requestsRepo.getAttempts(
      parseIp(req),
      10,
      trueDate,
      fullUrl,
    );
    await this.requestsRepo.addRequest(parseIp(req), trueDate, fullUrl);
    if (attemptsCount > 20) {
      throw new HttpException(
        "too many request from YOU! (by LoggerMiddleware)",
        429,
      );
    }
    next();
  }
}
