import { BlogService } from "../bloggers/blog.service";
import { Injectable } from "@nestjs/common";
import { PostService } from "../posts/post.service";

@Injectable()
export class BlogPostService {
    constructor(
        private readonly blogService: BlogService,
        private readonly postService: PostService,
    ) {
    }

    async getBlogNameById(id: string){
        return await this.blogService.getBlogNameById(id)
    }
}