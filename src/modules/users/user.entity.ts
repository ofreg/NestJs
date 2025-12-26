import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Card } from '../cards/card.entity';
import { Asset } from '../wallet/asset.entity';
import { Transaction } from '../transactions/transaction.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 320 })
  email!: string;

  @Column({ type: 'varchar', length: 200 })
  passwordHash!: string;

  @Column({ type: 'varchar', nullable: true })
  refreshTokenHash!: string | null;

  @Column({ type: 'numeric', precision: 18, scale: 2, default: 0 })
  balanceUah!: string;

  @OneToMany(() => Card, (c) => c.user)
  cards!: Card[];

  @OneToMany(() => Asset, (a) => a.user)
  assets!: Asset[];

  @OneToMany(() => Transaction, (t) => t.user)
  transactions!: Transaction[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
