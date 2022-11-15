import { IsUrl } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PremiumOrders } from './premium.orders.entity';

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

  @OneToMany(() => PremiumOrders, premiumOrders => premiumOrders.Premium)
  Premium_orders: PremiumOrders[];
}
