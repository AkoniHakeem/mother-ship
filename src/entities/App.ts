import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import AppUser from "./AppUser";
import Token from "./Token";

@Entity()
export default class App {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;
    
    @Column({ type: 'boolean', default: false})
    requireIdentityValidation: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: 'bigint'})
    projectId: string;
    
    // relations
    @OneToMany(() => AppUser, (appUser) => appUser.app)
    appUsers: AppUser[];

    @OneToMany(() => Token, (token) => token.app)
    tokens: Token[];
}