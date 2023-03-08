import { Module } from '@nestjs/common';
import { SuperadminController } from './superadmin.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { BindBlogToUserHandler } from './useCase/bindBlogToUserHandler';
import { IBlogsRepoToken } from '../bloggers/IBlogsRepo';
import { useRepositoryClassGeneric } from '../common/useRepositoryClassGeneric';
import { BlogsORM } from '../bloggers/blogs.ORM';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogEntity } from '../bloggers/entities/blogEntity';
import { UserEntity } from '../users/entity/user.entity';
import { SAGetAllBloggersHandler } from './useCase/SAGetAllBloggersHandler';
import { SetBanToBlogHandler } from './useCase/setBanToBlogHandler';

const saRouteHandlers = [
  BindBlogToUserHandler,
  SAGetAllBloggersHandler,
  SetBanToBlogHandler,
];
@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([BlogEntity, UserEntity])],
  controllers: [SuperadminController],
  providers: [
    ...saRouteHandlers,
    {
      provide: IBlogsRepoToken,
      useClass: useRepositoryClassGeneric(BlogsORM, BlogsORM, BlogsORM),
    },
  ],
  exports: [],
})
export class SuperAdminModule {}
