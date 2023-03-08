import { Repository } from 'typeorm';
import { RequestEntity } from './entities/request.entity';
import { IRequestRepo } from './IRequestRepo';
import { InjectRepository } from '@nestjs/typeorm';
import { addSeconds } from 'date-fns';

export class RequestORM
  extends Repository<RequestEntity>
  implements IRequestRepo<RequestEntity>
{
  constructor(
    @InjectRepository(RequestEntity)
    private readonly requestsRepo: Repository<RequestEntity>,
  ) {
    super(RequestEntity, requestsRepo.manager, requestsRepo.queryRunner);
  }

  async addRequest(ip: string, trueDate: Date, fullUrl: string) {
    return await this.requestsRepo
      .createQueryBuilder()
      .insert()
      .into(RequestEntity)
      .values({ ip: ip, reqDate: trueDate, endPoint: fullUrl })
      .execute();
  }

  async getAttempts(
    ip: string,
    attemptsInterval: number,
    trueDate: Date,
    fullUrl: string,
  ) {
    const initTime = addSeconds(trueDate, -attemptsInterval);
    return await this.requestsRepo
      .createQueryBuilder('request')
      .select('COUNT(request)', 'count')
      .where('request.ip = :ip', { ip: ip })
      .andWhere('request.endPoint = :url', { url: fullUrl })
      .andWhere('request.reqDate > :initTime', { initTime: initTime })
      .getCount();
  }
}
