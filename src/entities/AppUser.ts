import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import App from "./App";
import AppUserLocation from "./AppUserLocation";
import Project from "./Project";
import Token from "./Token";
import User from "./User";
import UserContactAddress from "./UserContactAddress";
import UsersCountries from "./UsersCountries";

@Entity()
export default class AppUser {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: string;

    firstName: string;

    lastName: string;

    @Column({ type: 'varchar', })
    password: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

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

    @ManyToOne(() => User, (user) => user.userApps)
    @JoinColumn({ name: 'userId'})
    user: User;

    @ManyToOne(() => Project, (project) => project.appUsers)
    @JoinColumn({ name: 'projectId'})
    project: Project;

    @OneToMany(() => Token, (token) => token.appUser)
    tokens: Token[];

    @OneToMany(() => UsersCountries, (usersCountries) => usersCountries.appUser)
    appUsersCountries: UsersCountries[];

    @OneToMany(() => UserContactAddress, (contactAddress) => contactAddress.appUser)
    addresses: UserContactAddress[];

    @OneToMany(() => AppUserLocation, (location) => location.appUser)
    previousLocations: AppUserLocation[];

    // TODO: update the permissions relations
    permissions: [];
} 