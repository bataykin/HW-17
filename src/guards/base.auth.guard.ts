import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class BaseAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    // console.log(context)
    if (request.headers.authorization == 'Basic YWRtaW46cXdlcnR5') {
      return true;
    }
    throw new UnauthorizedException('bad basic authorization');
  }
}
