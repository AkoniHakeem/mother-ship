import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import User from "./User";

@Entity()
export default class Location {

    /**
     * Last user's Location. This is a geographic location - long and lat.
     */
    @Column({ type: 'varchar', nullable: false })
    lastLocation: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // foregin keys
    @PrimaryColumn({ type: 'bigint'})
    userId: string;

    // relations
    @OneToOne(() => User, (user) => user.lastLocation)
    @JoinColumn({ name: 'userId'})
    user: User;
}