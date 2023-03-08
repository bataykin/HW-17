import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('requests')
export class RequestEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ip: string;

  @Column()
  reqDate: Date;

  @Column()
  endPoint: string;

  @Column({ nullable: true })
  login: string;
}
