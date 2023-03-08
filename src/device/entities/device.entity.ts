import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "../../users/entity/user.entity";

@Entity({name: 'devices'})
export class DeviceEntity extends BaseEntity{
    @PrimaryGeneratedColumn("uuid")
    id: string

    @CreateDateColumn()
    issuedAt: Date

    @Column()
    lastActiveDate: Date

    @Column("uuid")
    deviceId: string

    @Column()
    title: string

    @Column()
    ip: string

    @Column()
    userId: string

    @Column({default: false})
    loggedOut: boolean

    @ManyToOne(()=>UserEntity, (user) => user.devices, {})
    user:UserEntity

}
