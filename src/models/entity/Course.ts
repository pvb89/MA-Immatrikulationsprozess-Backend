import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";
import { Entry } from "./Entry";

@Entity()
export class Course{

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    description: string;

    @Column()
    subjectArea: string;
    
    @Column()
    graduation: string;

    @OneToMany(() => Entry, entry => entry.course)
    course: Entry[];

}
