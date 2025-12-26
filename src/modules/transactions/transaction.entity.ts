import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';

export type TransactionType = 'DEPOSIT' | 'EXCHANGE';
export type ExchangeSide = 'BUY' | 'SELL';

@Entity('transactions')
@Index(['user', 'createdAt'])
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (u) => u.transactions, { onDelete: 'CASCADE' })
  user!: User;

  @Column({ type: 'varchar', length: 10 })
  type!: TransactionType;

 
  @Column({ type: 'varchar', length: 3, nullable: true })
  depositCurrency!: string | null;

  @Column({ type: 'numeric', precision: 18, scale: 6, nullable: true })
  depositAmount!: string | null;

  @Column({ type: 'numeric', precision: 18, scale: 6, nullable: true })
  depositRateUahPerUsd!: string | null;

  @Column({ type: 'numeric', precision: 18, scale: 2, nullable: true })
  depositCreditedUah!: string | null;

 
  @Column({ type: 'varchar', length: 4, nullable: true })
  exchangeSide!: ExchangeSide | null;

  @Column({ type: 'varchar', length: 3, nullable: true })
  exchangeCurrency!: string | null;

  @Column({ type: 'numeric', precision: 18, scale: 6, nullable: true })
  exchangeCurrencyAmount!: string | null;

  @Column({ type: 'numeric', precision: 18, scale: 2, nullable: true })
  exchangeUahAmount!: string | null;

  @Column({ type: 'numeric', precision: 18, scale: 6, nullable: true })
  exchangeRateUahPerCurrency!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
