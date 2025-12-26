import { Module } from '@nestjs/common';
import { ExchangeController } from './exchange.controller';
import { ExchangeService } from './exchange.service';
import { UsersModule } from '../users/users.module';
import { WalletModule } from '../wallet/wallet.module';
import { RatesModule } from '../rates/rates.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [UsersModule, WalletModule, RatesModule, TransactionsModule],
  controllers: [ExchangeController],
  providers: [ExchangeService],
})
export class ExchangeModule {}
