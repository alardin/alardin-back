import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Users } from "./users.entity";

@Entity({ schema: 'alardin', name: 'assets' })
export class Assets {

    @PrimaryGeneratedColumn()
    id: number;
    
    @ApiProperty({
        name: 'coin',
        description: '보유 코인량',
        example: 205
    })
    @Column('int', { default: 0 })
    coin: number;
    
    @ApiProperty({
        name: 'is_premium',
        description: '프리미엄 여부',
        example: false
    })
    @Column('bool', { default: false })
    is_premium: boolean;

    @Column('int', { name: 'User_id', nullable: true})
    User_id: number | null;

    @OneToOne(() => Users)
    @JoinColumn([{ name: 'User_id', referencedColumnName: 'id' }])
    User: Users;

}