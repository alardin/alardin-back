import { Column, CreateDateColumn, Entity, ManyToOne } from "typeorm";
import { PremiumOrder } from "./premium.order.entity";
import { Users } from "./users.entity";

@Entity({ name: 'premium_refund', schema: 'alardin' }) 
export class PremiumRefund {

    @Column()
    price: number;

    @CreateDateColumn()
    created_at: Date;

    @Column()
    successed_at: Date;

    @ManyToOne(() => Users, users => users.Premium_refunds)
    User: Users;

    @ManyToOne(() => PremiumOrder, premiumOrder => premiumOrder.Premium_refunds)
    Premium_order: PremiumOrder;
}