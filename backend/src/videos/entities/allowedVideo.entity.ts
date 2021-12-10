import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/Models/user.entity';
import { Video } from './video.entity';

@Entity()
export class AllowedVideo {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Video, (_) => _, {
    cascade: true,
    onDelete: 'CASCADE',
    nullable: false,
    orphanedRowAction: 'delete',
  })
  @JoinColumn()
  video: Video;

  @Column('int', { default: 0 })
  votes: number;

  @Column('int', { nullable: true })
  queuePositon: number;

  @OneToOne(() => User, (_) => _, {
    cascade: true,
    onDelete: 'CASCADE',
    nullable: false,
    orphanedRowAction: 'delete',
  })
  allower: User;

  @Column({ nullable: false })
  allowerId: number;
}
