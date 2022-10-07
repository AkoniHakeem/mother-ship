import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import City from "./City";
import UsersCountries from "./UsersCountries";

@Entity()
export default class Street {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: string;

    @Column({ type: 'varchar', nullable: false})
    name: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // foregin keys
    @Column({ type: 'bigint', unsigned: false})
    cityId: string;

    // relations
    @ManyToOne(() => City, (city) => city.streets)
    city: City;

    @OneToMany(() => UsersCountries, (usersCountries) => usersCountries.street)
    usersCountries: UsersCountries[];
}