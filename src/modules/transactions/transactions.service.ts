import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';

@Injectable()
export class TransactionsService {
  constructor(@InjectRepository(Transaction) private readonly repo: Repository<Transaction>) {}

  async listForUser(userId: string) {
    return this.repo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' as any },
      take: 200,
    });
  }

  async createDeposit(args: {
    userId: string;
    fromCurrency: string;
    fromAmount: number;
    rateUahPerUsd: number;
    creditedUah: number;
  }) {
    const t = this.repo.create({
      user: { id: args.userId } as any,
      type: 'DEPOSIT',
      depositCurrency: args.fromCurrency,
      depositAmount: args.fromAmount.toFixed(6),
      depositRateUahPerUsd: args.rateUahPerUsd.toFixed(6),
      depositCreditedUah: args.creditedUah.toFixed(2),
    });
    return this.repo.save(t);
  }

  async createExchange(args: {
    userId: string;
    side: 'BUY' | 'SELL';
    currency: string;
    currencyAmount: number;
    uahAmount: number;
    rateUahPerCurrency: number;
  }) {
    const t = this.repo.create({
      user: { id: args.userId } as any,
      type: 'EXCHANGE',
      exchangeSide: args.side,
      exchangeCurrency: args.currency.toUpperCase(),
      exchangeCurrencyAmount: args.currencyAmount.toFixed(6),
      exchangeUahAmount: args.uahAmount.toFixed(2),
      exchangeRateUahPerCurrency: args.rateUahPerCurrency.toFixed(6),
    });
    return this.repo.save(t);
  }
}
