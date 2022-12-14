import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import UserCountryRelationships from "../lib/enums/userCountryRelationships.enum";
import Address from "./UserContactAddress";
import UserContactAddress from "./UserContactAddress";
import UsersCountries from "./UsersCountries";
import Location from "./Location";
import AppUser from "./AppUser";
import ProjectUser from "./ProjectUser";

@Entity()
export default class User {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: string;
    
    @Column({ type: 'varchar', default: ''})
    firstName: string;

    @Column({ type: 'varchar', default: ''})
    lastName: string;

    @Column({type: 'varchar', nullable: false})
    email: string;

    // foreign key
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    defaultCountryRelationship = UserCountryRelationships.RESIDENCE


    // relations
    @OneToMany(() => UsersCountries, (usersCountries) => usersCountries.user)
    usersCountries: UsersCountries[];

    @OneToMany(() => Address, (users) => users)
    addresses: UserContactAddress;

    @OneToMany(() => Location, (location) => location.user)
    lastLocation: Location;

    @OneToMany(() => AppUser, (appUser) => appUser.user)
    appUsers: AppUser[];

    @OneToMany(() => ProjectUser, (projectUser) => projectUser.user)
    projectUsers: ProjectUser[];
}