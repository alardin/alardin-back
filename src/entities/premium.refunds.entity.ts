import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { PremiumOrders } from "./premium.orders.entity";
import { Users } from "./users.entity";

@Entity({ name: 'premium_refund', schema: 'alardin' }) 
export class PremiumRefunds {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    price: number;

    @CreateDateColumn()
    created_at: Date;

    @Column()
    successed_at: Date;

    @ManyToOne(() => Users, users => users.Premium_refunds)
    @JoinColumn({ name: 'User_id', referencedColumnName: 'id' })
    User: Users;

    @OneToOne(() => PremiumOrders)
    @JoinColumn({ name: "Premium_order_id", referencedColumnName: "id" })
    Premium_order: PremiumOrders;
}