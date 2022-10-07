import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import AppUser from "./AppUser";

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

    // foreign keys
    @Column({ type: 'bigint'})
    tokenId: string;

    @Column({ type: 'bigint'})
    projectId: string;
    
    // relations
    @OneToMany(() => AppUser, (appUser) => appUser.app)
    appUsers: AppUser[];
}