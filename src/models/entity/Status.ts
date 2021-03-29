import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";
import { Entry } from "./Entry";

@Entity()
export class Status {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    status: string;

    @Column()
    description: string;

    @OneToMany(() => Entry, entry => entry.status)
    entry: Entry[];
    
}
