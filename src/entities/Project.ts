import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import AppUser from "./AppUser";
import ProjectUser from "./ProjectUser";

@Entity()
export default class Project { 
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true})
    id: string;

    @Column({ type: 'varchar', nullable: false})
    name: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    // foregin keys

    // relations
    @OneToMany(() => ProjectUser, (projectUser) => projectUser.project)
    projectUsers: ProjectUser[];

    @OneToMany(() => AppUser, (appUser) => appUser.project)
    appUsers: AppUser[];
}