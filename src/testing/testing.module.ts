import { Module } from "@nestjs/common";
import { TestingSQLService } from "./testing.SQL.service";
import { TestingController } from "./testing.controller";
import { TestingORMService } from "./testing.ORM.service";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [TestingController],
  providers: [TestingSQLService, TestingORMService],
})
export class TestingModule {}
