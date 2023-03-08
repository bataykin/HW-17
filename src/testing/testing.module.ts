import { Module } from '@nestjs/common';
import { TestingSQLService } from './testing.SQL.service';
import { TestingController } from './testing.controller';
import { TestingORMService } from './testing.ORM.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReftokenEntity } from '../auth/entities/reftoken.entity';
import { CommentEntity } from '../comments/entities/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReftokenEntity, CommentEntity])],
  controllers: [TestingController],
  providers: [TestingSQLService, TestingORMService],
})
export class TestingModule {}
