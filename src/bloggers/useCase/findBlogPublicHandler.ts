import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Inject, NotFoundException } from "@nestjs/common";
import { IBlogsRepo, IBlogsRepoToken } from "../DAL/IBlogsRepo";
import { BlogEntity } from "../entities/blogEntity";
import { BlogViewModel } from "../dto/BlogViewModel";

export class FindBlogPublicQuery {
  constructor(public readonly blogId: string) {}
}

@QueryHandler(FindBlogPublicQuery)
export class FindBlogPublicHandler
  implements IQueryHandler<FindBlogPublicQuery>
{
  constructor(
    @Inject(IBlogsRepoToken)
    private readonly blogsRepo: IBlogsRepo<BlogEntity>,
  ) {}
  async execute(query: FindBlogPublicQuery): Promise<BlogViewModel> {
    const { blogId } = query;
    const blog = await this.blogsRepo.findBlogById(blogId);
    if (!blog) {
      throw new NotFoundException("net takogo blogId");
    }
    const result: BlogViewModel = await this.blogsRepo.mapBlogToResponse(blog);
    return result;
  }
}
