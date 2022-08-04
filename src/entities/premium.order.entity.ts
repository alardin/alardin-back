import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PremiumRefund } from "./premium.refund.entity";
import { Premiums } from "./premiums.entity";
import { Users } from "./users.entity";

@Entity({ schema: 'alardin', name: 'premium_subscribe_records' })
export class PremiumOrder {

    @Column()
    price: number;

    @Column()
    pay_type: string;

    @CreateDateColumn()
    created_at: Date;

    @Column()
    successed_at: Date;

    @Column()
    expired_at: Date;
    
    @Column()
    next_order_at: Date;    

    @Column({ name: 'User_id', primary: true })
    User_id: number;
    
    @Column({ name: 'Premium_id', primary: true })
    Premium_id: number;

    @OneToMany(() => PremiumRefund, premiumRefund => premiumRefund.Premium_order)
    Premium_refunds: PremiumRefund[];

    @ManyToOne(() => Users, users => users.Premium_orders, {
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    })
    @JoinColumn([{ name: 'User_id', referencedColumnName: 'id' }])
    User: Users;

    @ManyToOne(() => Premiums, premiums => premiums.Premium_orders, {
        onDelete: 'CASCADE', 
        onUpdate: 'CASCADE'
    })
    @JoinColumn([{ name: 'Premium_id', referencedColumnName: 'id' }])
    Premium: Premiums;
}