import { Entity, PrimaryGeneratedColumn, OneToOne, Column, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { VoteDTO } from '../dto/vote.dto';
import { AllowedVideo } from './allowedVideo.entity';

@Entity()
export class Vote {
    @PrimaryGeneratedColumn()
    id: number;

    //For what he voted
    // IMPORTANT: THIS IS ALLOWED VIDEO ENTITY
    @OneToOne(() => AllowedVideo, (_) => _, {
        cascade: true,
        onDelete: 'CASCADE',
        nullable: false,
        orphanedRowAction: 'delete',
    })
    video: AllowedVideo;

    @Column({ nullable: false })
    videoId: number;

    //Voter of video
    @OneToOne(() => User, (_) => _, {
        cascade: true,
        onDelete: 'CASCADE',
        nullable: false,
        orphanedRowAction: 'delete',
    })
    voter: User;

    @Column({ nullable: false })
    voterId: number;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', nullable: false })
    createdDate: Date;

    toDTO(): VoteDTO {
        return new VoteDTO(this);
    }
}
