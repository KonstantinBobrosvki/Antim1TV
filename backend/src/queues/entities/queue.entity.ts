import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Queue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { unique: true, nullable: false, length: 30 })
  name: string;
}
