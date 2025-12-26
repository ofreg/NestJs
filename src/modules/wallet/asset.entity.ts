import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('assets')
@Index(['user', 'code'], { unique: true })
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (u) => u.assets, { onDelete: 'CASCADE' })
  user!: User;

  @Column({ type: 'varchar', length: 3 })
  code!: string; 

  @Column({ type: 'numeric', precision: 18, scale: 6, default: 0 })
  amount!: string;
}
