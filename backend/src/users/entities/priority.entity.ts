import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Priority {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'int',
        nullable: false,
        unsigned: true,
    })
    value: number;

    @OneToOne(() => User, (user) => user.priority, {
        cascade: true,
        onDelete: 'CASCADE',
        nullable: false,
        orphanedRowAction: 'delete',
    })
    @JoinColumn()
    receiver: User;

    @ManyToOne(() => User, (_) => _, {
        cascade: true,
        onDelete: 'SET NULL',
        nullable: true,
        orphanedRowAction: 'nullify',
    })
    giver: User;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
    public created_at: Date;

    @UpdateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP(6)',
        onUpdate: 'CURRENT_TIMESTAMP(6)',
    })
    public updated_at: Date;
}
