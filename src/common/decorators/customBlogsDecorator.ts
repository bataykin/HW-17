import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const CurrentBlogName = createParamDecorator(
    (data: unknown, context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest();
        const id = request.body.blogId;
        // implement resolve blog name from id
        return id
    },
);
