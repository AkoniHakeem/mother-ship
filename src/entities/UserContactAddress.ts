import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import AppUser from "./AppUser";
import User from "./User";

@Entity()
export default class UserContactAddress {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: string;

    @Column({ type: 'varchar'})
    type: string;

    @Column({ type: 'varchar'})
    landmark: string;
    
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // foreign keys
    @Column({ type: 'bigint', nullable: true})
    userId: string; 

    @Column({ type: 'bigint', nullable: true })
    appUserId: string | null;

    // relations
    @ManyToOne(() => User, (user) => user.addresses)
    @JoinColumn({ name: 'userId'})
    user: User;
    
    @ManyToOne(() => AppUser, (appUser) => appUser.addresses)
        @JoinColumn({ name: 'appUserId'})
    appUser: AppUser;
}