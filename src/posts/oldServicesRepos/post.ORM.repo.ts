import {Injectable} from "@nestjs/common";
import {CreatePostDto} from "../dto/create-post.dto";
import {InjectRepository} from "@nestjs/typeorm";
import {LikeEntity} from "../../likes/entities/like.entity";
import {Column, getRepository, Repository} from "typeorm";
import {PostEntity} from "../entities/post.entity";
import {UpdatePostDto} from "../dto/update-post.dto";

@Injectable()
export class PostORMRepo extends Repository<PostEntity> {
    constructor(@InjectRepository(PostEntity)
                private readonly postsRepository: Repository<PostEntity>,
    ) {
        super(PostEntity, postsRepository.manager, postsRepository.queryRunner);
    }

    async isExists(dto: CreatePostDto) {
        const result = await this.postsRepository.createQueryBuilder('posts')
            .select(['posts.title', 'posts.bloggerId'])
            .where('title =:title', {title: dto.title})
            .andWhere('"bloggerId"=:bloggerId', {"bloggerId": dto.blogId})
            .getOne()
        return result
    }

    async createPost(post: { addedAt: Date; extendedLikesInfo: { likesCount: number; newestLikes: any[]; dislikesCount: number; myStatus: string }; bloggerName: any; shortDescription: string; id: undefined; title: string; content: string; bloggerId: string }) {
        // const createdId = await this.postsRepository.createQueryBuilder()
        //
        //     .insert()
        //     .into(PostEntity)
        //     .values([{
        //         title: post.title,
        //         shortDescription: post.shortDescription,
        //         content: post.content,
        //         bloggerId: +post.bloggerId,
        //         addedAt: post.addedAt,
        //         // extendedLikesInfo: post.extendedLikesInfo,
        //         // bloggerName: post.bloggerName,
        //     }])
        //     .execute()


        // const p = new PostEntity()


        const createdPost = await this.postsRepository.create(
            {
                title: post.title,
                shortDescription: post.shortDescription,
                content: post.content,
                blogId: post.bloggerId,
                createdAt: post.addedAt,
                // extendedLikesInfo: post.extendedLikesInfo,
                blogName: post.bloggerName,
            }
        )
        // console.log('createPost ', createdPost)
        const a = await this.postsRepository.save(createdPost).catch((err) => {
            // console.log(err)
        })

        // console.info('new post instance a', a)
        const result = await this.postsRepository.createQueryBuilder()
            .select()
            // .leftJoinAndSelect('bloggers', 'posts.bloggerId')
            .where("id=:postId", {postId: createdPost.id})
            .getOne()
        return result
    }

    async getAll(skipSize: number, PageSize: number | 10) {
        const posts = await this.postsRepository.find({
            skip: skipSize,
            take: PageSize,
        })
        return posts
    }

    async findById(id: string) {
        const result = await this.postsRepository.findOneBy({id: id})
        return result
    }

    async updatePost(id: string, dto: UpdatePostDto) {
        const res = await this.postsRepository.update(
            {id: id},
            {
                title: dto.title,
                content: dto.content,
                shortDescription: dto.shortDescription,
                blogId: dto.blogId
            })
        return res
    }

    async deletePost(id: string) {
        return await this.postsRepository.delete({id: id})

    }
}
