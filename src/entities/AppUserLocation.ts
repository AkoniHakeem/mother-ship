import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import AppUser from "./AppUser";
import User from "./User";

@Entity()
export default class AppUserLocation {

    /**
     * Last user's Location. This is a geographic location - long and lat.
     */
    @Column({ type: 'varchar', nullable: false })
    previousLocation: string;

    @CreateDateColumn()
    createdAt: Date;

    // foregin keys
    @PrimaryColumn({ type: 'bigint'})
    appUserId: string;

    // relations
    @OneToOne(() => AppUser, (user) => user.previousLocations)
    @JoinColumn({ name: 'userId'})
    appUser: AppUser;
}