import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm";
import {User} from "./User"
import {Course} from "./Course"
import {Status} from "./Status"
import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";



@Entity()
export class Entry {

    @PrimaryGeneratedColumn()
    id: number;
    
    @Column("datetime")
    date: Date;

    @Column()
    @IsString()
    @IsNotEmpty()
    gender: string;

    @Column("date")
    @IsDate()
    @IsNotEmpty()
    bday: Date;

    @Column()
    @IsString()
    @IsNotEmpty()
    birthplace: string;

    @Column()
    @IsString()
    @IsNotEmpty()
    birthcountry: string;

    @Column()
    @IsString()
    @IsNotEmpty()
    nationality: string;

    @Column()
    @IsString()
    @IsNotEmpty()
    street: string;

    @Column()
    @IsNumber()
    @IsNotEmpty()
    zipCode: number;

    @Column()
    @IsString()
    @IsNotEmpty()
    domicile: string;
    
    @Column()
    @IsString()
    @IsNotEmpty()
    country: string;

    @Column()
    @IsString()
    @IsNotEmpty()
    universityQualification: string

    @Column("decimal", { precision: 2, scale: 1 })
    @IsNumber()
    @IsNotEmpty()
    averageGrade: number

    @Column()
    @IsBoolean()
    @IsNotEmpty()
    healthInsuranceStatus: boolean

    @Column()
    @IsString()
    healthInsuranceName: string

    @Column()
    @IsNumber()
    healthInsuranceNumber: number

    @Column()
    @IsString()
    // @IsNotEmpty()
    educationCertificateFile: string

    @ManyToOne(type => User, user => user.id, { eager: true, onDelete: 'CASCADE'})
    user: User;

    @Column({ type: 'int', nullable: true })
    public userId?: number | null

    @ManyToOne(type => Course, course => course.id, { eager: true, onDelete: 'CASCADE'})
    course: Course;

    @Column({ type: 'int', nullable: true })
    public courseId?: number | null

    @ManyToOne(type => Status, status => status.id, { eager: true, onDelete: 'CASCADE'})
    status: Status;

    @Column({ type: 'int', nullable: true })
    public statusId?: number | null
}