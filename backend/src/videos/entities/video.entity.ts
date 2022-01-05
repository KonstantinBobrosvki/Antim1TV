import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    ManyToOne,
    CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/Models/user.entity';
import { VideoDto } from '../dto/video.dto';
import { Queue } from '../../queues/entities/queue.entity';

@Entity()
export class Video {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', { nullable: false })
    link: string;

    @Column('boolean', { nullable: true })
    isAllowed: boolean;

    @OneToOne(() => User, (_) => _, {
        cascade: true,
        onDelete: 'CASCADE',
        nullable: false,
        orphanedRowAction: 'delete',
    })
    suggester: User;

    @Column({ nullable: true })
    suggesterId: number;

    @ManyToOne(() => Queue, (_) => _, {
        cascade: true,
        onDelete: 'CASCADE',
        nullable: false,
        orphanedRowAction: 'delete',
    })
    queue: Queue;

    @Column()
    queueId: number;

    @CreateDateColumn()
    createdDate: Date;

    toDTO(): VideoDto {
        const dto = new VideoDto();
        dto.id = this?.id;
        dto.isAllowed = this?.isAllowed;
        dto.link = this?.link;
        dto.queueId = this.queueId;
        dto.createdDate = this.createdDate;
        return dto;
    }
}
