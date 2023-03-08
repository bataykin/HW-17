import { Controller, Delete, HttpCode } from '@nestjs/common';
import { TestingORMService } from './testing.ORM.service';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('testing')
export class TestingController {
  constructor(
    private readonly testingService: TestingORMService /* | TestingSQLService*/,
  ) {}

  @HttpCode(204)
  @Delete('all-data')
  async removeAll() {
    return this.testingService.removeAll();
  }

  @HttpCode(204)
  @Delete('delete-quiz')
  async removeQuiz() {
    return this.testingService.removeQuiz();
  }
}
