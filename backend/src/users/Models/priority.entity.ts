import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class Priority {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "int",
        nullable: false
    })
    value: number;

    @OneToOne(() => User, user => user.priority, {
        cascade: true,
        onDelete: "CASCADE",
        nullable: false,
        orphanedRowAction: 'delete'
    })
    @JoinColumn()
    receiver: User;

    @ManyToOne(() => User, _ => _, {
        cascade: true,
        onDelete: "CASCADE",
        nullable: true,
        orphanedRowAction: 'delete'
    })
    giver: User
}
