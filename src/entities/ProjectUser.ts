import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import Project from "./Project";
import Token from "./Token";
import User from "./User";

@Entity()
export default class ProjectUser {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: string;

    @Column({ type: 'boolean', nullable: true })
    isCreator: boolean;

    @Column({ type: 'boolean'})
    isAdmin: boolean;

    @Column({ type: 'varchar' })
    password: string;

    // foregin keys
    @Column({ type: 'bigint'})
    userId: string;

    @Column({ type: 'bigint', nullable: true})
    projectId: string;

    // relations
    @ManyToOne(() => User, (user) => user.projectUsers)
    @JoinColumn({ name: 'userId'})
    user: User;

    @ManyToOne(() => Project, (project) => project.projectUsers)
    @JoinColumn({ name: 'projectId'})
    project: Project;

    @OneToMany(() => Token, (token) => token.projectUser)
    tokens: Token[];

    // TODO: add relations for rules
    rules: []

}