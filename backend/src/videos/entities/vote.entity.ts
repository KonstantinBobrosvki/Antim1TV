import { Entity, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { User } from '../../users/Models/user.entity';
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

  //Voter of video
  @OneToOne(() => User, (_) => _, {
    cascade: true,
    onDelete: 'CASCADE',
    nullable: false,
    orphanedRowAction: 'delete',
  })
  voter: User;
}
