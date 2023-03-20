import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const UserFromToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const token = request.headers?.authorization;
    return token.split(" ")[1];
  },
);
