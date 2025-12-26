import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardsService } from '../cards/cards.service';
import { RatesService } from '../rates/rates.service';
import { TransactionsService } from '../transactions/transactions.service';
import { UsersService } from '../users/users.service';
import { Asset } from './asset.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Asset) private readonly repo: Repository<Asset>,
    private readonly users: UsersService,
    private readonly cards: CardsService,
    private readonly rates: RatesService,
    private readonly tx: TransactionsService,
  ) {}

  async listAssets(userId: string) {
    const assets = await this.repo.find({ where: { user: { id: userId } } });
    return assets.map((a) => ({ code: a.code, amount: a.amount }));
  }

  async deposit(userId: string, cardId: string, amount: number, currency: string) {
    const cards = await this.cards.listForUser(userId);
    const card = cards.find((c) => c.id === cardId);
    if (!card) throw new BadRequestException('Card not found');

    const conv = await this.rates.convertToUah(amount, currency);
    const uahAdded = Number(conv.uah.toFixed(2));

    await this.users.addToBalance(userId, uahAdded);

    await this.tx.createDeposit({
      userId,
      fromCurrency: currency.toUpperCase(),
      fromAmount: amount,
      rateUahPerUsd: conv.rateUahPerUsd,
      creditedUah: uahAdded,
    });

    return { creditedUah: uahAdded };
  }

  async addAsset(userId: string, code: string, delta: number) {
    const c = code.toUpperCase();
    const existing = await this.repo.findOne({ where: { user: { id: userId }, code: c } });
    if (!existing) {
      const a = this.repo.create({ user: { id: userId } as any, code: c, amount: delta.toFixed(6) });
      return this.repo.save(a);
    }
    const next = Number(existing.amount) + delta;
    existing.amount = next.toFixed(6);
    return this.repo.save(existing);
  }

  async subtractAsset(userId: string, code: string, delta: number) {
    const c = code.toUpperCase();
    const existing = await this.repo.findOne({ where: { user: { id: userId }, code: c } });
    const current = existing ? Number(existing.amount) : 0;
    if (current < delta) throw new BadRequestException('Not enough asset balance');
    existing!.amount = (current - delta).toFixed(6);
    return this.repo.save(existing!);
  }
}
