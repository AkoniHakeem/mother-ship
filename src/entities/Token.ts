import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TokenCreationPurpose } from "../lib/enums/tokenCreationPurpose";
import App from "./App";
import AppUser from "./AppUser";
import ProjectUser from "./ProjectUser";

@Entity()
export default class Token {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: string;

    @Column({ type: 'varchar'})
    valueOfToken: string;

    @Column({ type: 'numeric', nullable: true})
    expiry: number;

    @Column({ type: 'enum', enum: TokenCreationPurpose})
    purpose: TokenCreationPurpose;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // foregin keys
    @Column({ type: 'bigint', nullable: true})
    projectUserId: string;

    /**
     * Relates tokens to the an app user
     */
    @Column({ type: 'bigint', nullable: true})
    appUserId: string;

    /**
     * Relates tokens to the an app
     */
    @Column({ type: 'bigint', nullable: true})
    appId: string;

    // relations
    @ManyToOne(() => AppUser, (appUser) => appUser.tokens)
    appUser: AppUser;

    @ManyToOne(() => App, (app) => app.tokens)
    app: App;

    @ManyToOne(() => ProjectUser, (projectUser) => projectUser.tokens)
    projectUser: ProjectUser;

    // for compatibility
}