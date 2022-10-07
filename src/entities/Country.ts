import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import City from "./City";
import UsersCountries from "./UsersCountries";

@Entity()
export default class Country {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true})
    id: string;

    @Column({ type: 'varchar', nullable: false})
    name: string;

    @Column({ type: 'varchar', default: ''})
    phoneCode: string;

    @Column({ type: 'varchar', default: ''})
    currency: string;

    /* This is the country code. */
    @Column({ type: 'varchar', default: ''})
    code: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // relations
    // @OneToMany(() => User, (user) => user.countryOfResidence)
    // users: User[];

    @OneToMany(() => City, (city) => city.country)
    cities: City[];

    @OneToMany(() => UsersCountries, (usersCountries) => usersCountries.country)
    userContries: UsersCountries[];
}