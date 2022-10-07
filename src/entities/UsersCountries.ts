import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import UserCountryRelationships from "../lib/enums/userCountryRelationships.enum";
import { PhoneNumber } from "../lib/types";
import City from "./City";
import Country from "./Country";
import Street from "./Street";
import User from "./User";

@Entity()
export default class UsersCountries {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: string;

    @Column({ type: 'enum', enum: UserCountryRelationships})
    relationship: UserCountryRelationships;

    @Column({ type: 'jsonb', nullable: true })
    phoneNumber: PhoneNumber[] | null;

    // foregin keys
    @Column({ type: 'bigint', nullable: false })
    userId: string;

    @Column({ type: 'bigint', nullable: false })
    countryId: string;

    @Column({ type: "bigint", nullable: true })
    cityId: string | null;

    @Column({ type: "bigint", nullable: true })
    streetId: string | null;

    // relations
    @ManyToOne(() => Country, (country) => country.userContries)
    @JoinColumn({ name: 'countryId' })
    country: Country;

    @ManyToOne(() => User, (user) => user.usersCountries)
    @JoinColumn({ name: 'userId'})
    user: User;

    @ManyToOne(() => City, (city) => city.usersCountries)
    @JoinColumn({ name: 'cityId'})
    city: City | null; 

    @ManyToOne(() => Street, (street) => street.usersCountries)
    @JoinColumn({ name: 'streetId'})
    street: Street | null;

}