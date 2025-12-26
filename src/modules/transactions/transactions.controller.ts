import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/user.decorator';
import { TransactionsService } from './transactions.service';

@ApiTags('transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly tx: TransactionsService) {}

  @Get()
  async list(@CurrentUser() u: { userId: string }) {
    const items = await this.tx.listForUser(u.userId);
    return items.map((t) => ({
      id: t.id,
      type: t.type,
      createdAt: t.createdAt,
      deposit: t.type === 'DEPOSIT'
        ? {
            currency: t.depositCurrency,
            amount: t.depositAmount,
            rateUahPerUsd: t.depositRateUahPerUsd,
            creditedUah: t.depositCreditedUah,
          }
        : null,
      exchange: t.type === 'EXCHANGE'
        ? {
            side: t.exchangeSide,
            currency: t.exchangeCurrency,
            currencyAmount: t.exchangeCurrencyAmount,
            uahAmount: t.exchangeUahAmount,
            rateUahPerCurrency: t.exchangeRateUahPerCurrency,
          }
        : null,
    }));
  }
}
