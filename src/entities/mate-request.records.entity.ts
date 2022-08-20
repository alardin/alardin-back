import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Users } from "./users.entity";

@Entity({ schema: 'alardin' })
export class MateRequestRecords {

    @Column('varchar', { name: 'type' })
    type: string;

    @CreateDateColumn({ name: 'sended_at' })
    sended_at: Date;    

    @Column({ name: 'Sender_id', primary: true })
    Sender_id: number;

    @Column({ name: 'Receiver_id', nullable: true })
    Receiver_id: number | null;

    @ManyToOne(() => Users, users => users.Send_requests)
    @JoinColumn({ name: 'Sender_id', referencedColumnName: 'id'})
    Sender: Users;
    
    @ManyToOne(() => Users, users => users.Receiveds)
    @JoinColumn({ name: 'Receiver_id', referencedColumnName: 'id'})
    Receiver: Users;

    
}