import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity("reftokens")
export class ReftokenEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    token: string;

    @Column()
    isValid: boolean;

    @Column({nullable: true})
    replacedBy: string;

    @Column()
    expiresAt: Date;
}