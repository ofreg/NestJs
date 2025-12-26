import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (u) => u.cards, { onDelete: 'CASCADE' })
  user!: User;

  @Column({ type: 'varchar' })
  encryptedNumber!: string;

  @Column({ type: 'varchar', length: 4 })
  last4!: string;

  @Column({ type: 'smallint' })
  expMonth!: number;

  @Column({ type: 'smallint' })
  expYear!: number; 

  @CreateDateColumn()
  createdAt!: Date;
}
