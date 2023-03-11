import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { Request } from "express";
import { IRequestRepo, IRequestRepoToken } from "../auth/IRequestRepo";
import { RequestEntity } from "../auth/entities/request.entity";

const maxAttempts = 4;
const attemptsInterval = 10;

@Injectable()
export class RequestLimitGuard implements CanActivate {
  constructor(
    @Inject(IRequestRepoToken)
    private readonly requestsRepo: IRequestRepo<RequestEntity>, // protected readonly requestRepo: RequestRepoClass
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const trueDate = new Date();
    const fullUrl = request.baseUrl + request.path;

    const attempts = this.validateRequest(request, trueDate, fullUrl);

    // this.requestsRepo.addRequest(request.ip, trueDate, fullUrl).then(r => r)
    //
    //   const attemptsCount =  this.requestRepo.getAttempts(request.ip, 10, trueDate, fullUrl)
    // if (attemptsCount > 5) {
    //     res.sendStatus(429)
    //     return;
    // }
    // console.log('Attempts in last 10s = ' + attempts)

    if (6 > 5) {
      return true;
    }
    throw new UnauthorizedException("too much requests");
  }

  async validateRequest(request: Request, trueDate: Date, fullUrl: string) {
    // const user = request.user;
    // const trueDate = new Date()
    // const fullUrl = request.baseUrl + request.path
    //
    // await this.requestsRepo.addRequest(request.ip, trueDate, fullUrl)
    // const attemptsCount = await this.requestsRepo.getAttempts(request.ip, attemptsInterval, trueDate)
    // if (attemptsCount > maxAttempts)
    //     throw new HttpException('stop spamming!', 429)
    // console.log(attemptsCount)
    // console.log('Attempts in last 10s = ' + attemptsCount)
    // request.lastAttempts = attemptsCount
    // return 0 as number;
  }
}
