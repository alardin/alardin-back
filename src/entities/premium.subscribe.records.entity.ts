import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Premiums } from "./premiums.entity";
import { Users } from "./users.entity";

@Entity({ schema: 'alardin', name: 'premium_subscribe_records' })
export class PremiumSubscribeRecords {

    @Column()
    price: number;

    @Column()
    purchase_type: string;

    @CreateDateColumn()
    start_at: Date;

    @Column('date', { name: 'end_at' }) 
    end_at: Date; 

    @Column({ name: 'User_id', primary: true })
    User_id: number;
    
    @Column({ name: 'Premium_id', primary: true })
    Premium_id: number;

    @ManyToOne(() => Users, users => users.Premium_subscribe_records, {
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    })
    @JoinColumn([{ name: 'User_id', referencedColumnName: 'id' }])
    User: Users;

    @ManyToOne(() => Premiums, premiums => premiums.Premium_records, {
        onDelete: 'CASCADE', 
        onUpdate: 'CASCADE'
    })
    @JoinColumn([{ name: 'Premium_id', referencedColumnName: 'id' }])
    Premium: Premiums;
}