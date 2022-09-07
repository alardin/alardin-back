import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { PremiumOrders } from "./premium.orders.entity";
import { Users } from "./users.entity";

@Entity({ name: 'premium_refund', schema: 'alardin' }) 
export class PremiumRefunds {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'price' })
    price: number;

    @CreateDateColumn()
    created_at: Date;

    @Column({ name: 'successed_at' })
    successed_at: Date;

    @Column({ name: 'result_status' })
    result_status: string;

    @Column({ name: 'result_message' })
    result_message: string;

    @Column({ name: 'User_id' })
    User_id: number;

    @Column({ name: 'Premium_order_id' })
    Premium_order_id: number;

    @ManyToOne(() => Users, users => users.Premium_refunds)
    @JoinColumn({ name: 'User_id', referencedColumnName: 'id' })
    User: Users;

    @OneToOne(() => PremiumOrders)
    @JoinColumn({ name: "Premium_order_id", referencedColumnName: "id" })
    Premium_order: PremiumOrders;
}