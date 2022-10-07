import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import App from "./App";
import Project from "./Project";
import Token from "./Token";
import User from "./User";

@Entity()
export default class AppUser {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: string;

    @Column({ type: 'varchar', })
    password: string;

    // @CreateDateColumn()
    // createdAt: Date;

    // @UpdateDateColumn()
    // updatedAt: Date;

    @Column({ type: 'bigint'})
    // foregin keys
    appId: string;

    @Column({ type: 'bigint',})
    userId: string;

    @Column({ type: 'bigint'})
    projectId: string;

    // relations
    @ManyToOne(() => App, (app) => app.appUsers)
    @JoinColumn({ name: 'appId'})
    app: App;

    @ManyToOne(() => User, (user) => user.appUsers)
    @JoinColumn({ name: 'userId'})
    user: User;

    @ManyToOne(() => Project, (project) => project.appUsers)
    @JoinColumn({ name: 'projectId'})
    project: Project;

    @OneToMany(() => Token, (token) => token.appUser)
    tokens: Token[];

    // TODO: update the permissions relations
    permissions: [];
} 