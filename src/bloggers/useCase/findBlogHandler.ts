import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Inject, NotFoundException } from "@nestjs/common";
import { IBlogsRepo, IBlogsRepoToken } from "../DAL/IBlogsRepo";
import { BlogEntity } from "../entities/blogEntity";

export class FindBlogQuery {
  constructor(public readonly blogId: string) {}
}

@QueryHandler(FindBlogQuery)
export class FindBlogHandler implements IQueryHandler<FindBlogQuery> {
  constructor(
    @Inject(IBlogsRepoToken)
    private readonly blogsRepo: IBlogsRepo<BlogEntity>,
  ) {}
  async execute(query: FindBlogQuery): Promise<any> {
    const { blogId } = query;
    const blog = await this.blogsRepo.findBlogById(blogId);
    if (!blog) {
      throw new NotFoundException("net takogo blogId");
    }
    const result = await this.blogsRepo.mapBlogToResponse(blog);
    return Promise.resolve(result);
  }
}
