import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { UserDto } from '../dto/user.dto';
import { Priority } from './priority.entity';
import { Right } from './right.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 30, unique: true, nullable: false })
  username: string;

  @Column('varchar', { length: 72, nullable: false })
  password: string;

  @Column('varchar', { length: 72, unique: true, nullable: false })
  email: string;

  @OneToMany(() => Right, (right) => right.receiver)
  rights: Right[];

  @OneToOne(() => Priority, (priority) => priority.receiver)
  priority: Priority;

  toDTO(): UserDto {
    const userDto = new UserDto();
    userDto.id = this.id;
    userDto.username = this.username;
    userDto.email = this.email;
    userDto.rights =
      this.rights == null ? [] : this.rights.map((el) => el.value);
    userDto.priority = +this?.priority?.value;

    return userDto;
  }
}
