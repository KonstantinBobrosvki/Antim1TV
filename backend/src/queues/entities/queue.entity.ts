import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Queue {
  @ApiProperty({ example: 4 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Main' })
  @Column('varchar', { unique: true, nullable: false, length: 30 })
  name: string;
}
