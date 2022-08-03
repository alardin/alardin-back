import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Users } from "./users.entity";

@Entity({ schema: 'alardin', name: 'mates' })
export class Mates {
    @ApiProperty({
        name: 'id',
        example: 1
    })
    @PrimaryGeneratedColumn()
    id: number;
    
    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date | null;

    @Column({ name: 'Sender_id', nullable: true })
    Sender_id: number | null;

    @Column({ name: 'Receiver_id', nullable: true })
    Receiver_id: number | null;

    @ManyToOne(() => Users, users => users.Mate1, {
        onDelete: 'NO ACTION', 
        onUpdate: 'CASCADE'
    })
    @JoinColumn([{ name: 'Sender_id', referencedColumnName: 'id' }])
    Sender: Users;

    @ManyToOne(() => Users, users => users.Mate2, {
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE'
    })
    @JoinColumn([{ name: 'Receiver_id', referencedColumnName: 'id' }])
    Receiver: Users;
}