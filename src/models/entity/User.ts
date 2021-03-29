import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Unique, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { IsNotEmpty, IsEmail, IsString, IsBoolean, IsOptional } from 'class-validator';
import { Entry } from "./Entry";

@Entity()
@Unique(['mail'])
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @IsEmail()
    @IsNotEmpty()
    mail: string;

    @Column()
    @IsString()
    password: string;

    @Column()
    @IsString()
    @IsNotEmpty()
    firstname: string;

    @Column()
    @IsString()
    @IsNotEmpty()
    lastname: string;

    @Column()
    @IsBoolean()
    @IsOptional()
    admin: boolean;

    @Column("datetime")
    @UpdateDateColumn()
    loginDate: Date;

    @Column()
    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => Entry, entry => entry.user)
    user: Entry[];

}