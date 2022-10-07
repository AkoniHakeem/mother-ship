import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import Country from "./Country";
import Street from "./Street";
import UsersCountries from "./UsersCountries";

@Entity()
export default class City { 
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: string;

    @Column({ type: 'varchar', nullable: false })
    name: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // foregin keys
    @Column({ type: 'bigint', nullable: false})
    countryId: string;

    // relations
    @ManyToOne(() => Country, (country) => country.cities)
    country: Country;

    @OneToMany(() => UsersCountries, (userCountries) => userCountries.city)
    usersCountries: UsersCountries[];

    @OneToMany(() => Street, (street) => street.city)
    streets: Street[];
}