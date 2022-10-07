import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TokenCreationPurpose } from "../lib/enums/tokenCreationPurpose";
import AppUser from "./AppUser";
import ProjectUser from "./ProjectUser";

@Entity()
export default class Token {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: string;

    @Column({ type: 'varchar'})
    valueOfToken: string;

    @Column({ type: 'numeric'})
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

    @Column({ type: 'bigint', nullable: true})
    appUserId: string;

    // relations
    @ManyToOne(() => AppUser, (appUser) => appUser.tokens)
    appUser: AppUser;

    @ManyToOne(() => ProjectUser, (projectUser) => projectUser.tokens)
    projectUser: ProjectUser;

    // for compatibility
}