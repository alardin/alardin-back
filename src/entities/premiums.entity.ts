import { IsUrl } from "class-validator";
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Users } from "./users.entity";
import { PremiumSubscribeRecords } from "./premium.subscribe.records.entity";

@Entity({ schema: 'alardin', name: 'premiums' })
export class Premiums {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', { name: 'name', length: 30 })
    name: string;

    @Column({ name: 'price' })
    price: number;

    @Column('varchar', { name: 'description', length: 500 })
    description: string;

    @Column('varchar', { name: 'thumbnail_img_url', length: 2048 })
    @IsUrl()
    thumbnail_img_url: string;

    @OneToMany(() => PremiumSubscribeRecords, premiumSubscribeRecords => premiumSubscribeRecords.Premium)
    Premium_records: PremiumSubscribeRecords[];

    @ManyToMany(() => Users, users => users.Subscribed_premiums)
    Subscribers: Users[];

}