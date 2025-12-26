import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RatesService } from '../rates/rates.service';
import { WalletService } from '../wallet/wallet.service';
import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
export class ExchangeService {
  constructor(
    private readonly users: UsersService,
    private readonly rates: RatesService,
    private readonly wallet: WalletService,
    private readonly tx: TransactionsService,
  ) {}

  async buy(userId: string, currency: string, amountCurrency: number) {
    const code = currency.toUpperCase();
    if (code === 'UAH') throw new BadRequestException('Cannot buy UAH');

    
    const rUah = await this.rates.getRate('USD', 'UAH');
    const rCode = await this.rates.getRate('USD', code);
    if (!rUah || !rCode) throw new BadRequestException('Missing rate');

    const usd = amountCurrency / Number(rCode.value);
    const neededUah = usd * Number(rUah.value);
    const neededUah2 = Number(neededUah.toFixed(2));

    const user = await this.users.findById(userId);
    if (!user) throw new BadRequestException('User not found');
    if (Number(user.balanceUah) < neededUah2) throw new BadRequestException('Not enough UAH balance');

    await this.users.subtractFromBalance(userId, neededUah2);
    await this.wallet.addAsset(userId, code, amountCurrency);

    const rateUahPerCurrency = neededUah / amountCurrency;
    await this.tx.createExchange({
      userId,
      side: 'BUY',
      currency: code,
      currencyAmount: amountCurrency,
      uahAmount: neededUah2,
      rateUahPerCurrency,
    });

    return { spentUah: neededUah2, bought: { code, amount: amountCurrency } };
  }

  async sell(userId: string, currency: string, amountCurrency: number) {
    const code = currency.toUpperCase();
    if (code === 'UAH') throw new BadRequestException('Cannot sell UAH');

    const rUah = await this.rates.getRate('USD', 'UAH');
    const rCode = await this.rates.getRate('USD', code);
    if (!rUah || !rCode) throw new BadRequestException('Missing rate');

    const usd = amountCurrency / Number(rCode.value);
    const gainedUah = usd * Number(rUah.value);
    const gainedUah2 = Number(gainedUah.toFixed(2));

    await this.wallet.subtractAsset(userId, code, amountCurrency);
    await this.users.addToBalance(userId, gainedUah2);

    const rateUahPerCurrency = gainedUah / amountCurrency;
    await this.tx.createExchange({
      userId,
      side: 'SELL',
      currency: code,
      currencyAmount: amountCurrency,
      uahAmount: gainedUah2,
      rateUahPerCurrency,
    });

    return { gainedUah: gainedUah2, sold: { code, amount: amountCurrency } };
  }
}
