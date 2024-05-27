import { Entity, Column, OneToOne, JoinColumn, PrimaryColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { AllowedVideoDto } from '../dto/allowedVideo.dto';
import { Video } from './video.entity';

@Entity()
export class AllowedVideo {
    @PrimaryColumn({ nullable: false, name: 'id' })
    id: number;

    @OneToOne(() => Video, (_) => _, {
        cascade: true,
        onDelete: 'CASCADE',
        nullable: false,
        orphanedRowAction: 'delete',
    })
    @JoinColumn({ name: 'id' })
    video: Video;

    @Column('bigint', { default: 0 })
    votes: number;

    @Column('bigint', { nullable: true })
    queuePositon?: number;

    @OneToOne(() => User, (_) => _, {
        cascade: true,
        onDelete: 'CASCADE',
        nullable: false,
        orphanedRowAction: 'delete',
    })
    allower: User;

    @Column({ nullable: false })
    allowerId: number;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
    public created_at: Date;

    @Column('varchar', { length: 200, nullable: true })
    public comment: string;

    toDto() {
        const dto = new AllowedVideoDto();
        dto.video = this.video?.toDTO();
        dto.id = this.id;
        dto.queuePositon = this.queuePositon;
        dto.votes = this.votes;
        return dto;
    }
}
