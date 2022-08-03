import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Users } from "./users.entity";

@Entity({ schema: 'alardin' })
export class MateRequestRecords {
    
    @PrimaryColumn()
    id: number;

    @Column('varchar', { name: 'type' })
    type: string;

    @CreateDateColumn({ name: 'sended_at' })
    sended_at: Date;    

    @Column({ name: 'Sender_id', nullable: true })
    Sender_id: number | null;

    @Column({ name: 'Receiver_id', nullable: true})
    Receiver_id: number | null;

    @ManyToOne(() => Users, users => users.Send_requests)
    @JoinColumn({ name: 'Requester_id', referencedColumnName: 'id'})
    Sender: Users;
    
    @ManyToOne(() => Users, users => users.Receiveds)
    @JoinColumn({ name: 'Receiver_id', referencedColumnName: 'id'})
    Receiver: Users;

    
}