import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from './asset.entity';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { UsersModule } from '../users/users.module';
import { CardsModule } from '../cards/cards.module';
import { RatesModule } from '../rates/rates.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [TypeOrmModule.forFeature([Asset]), UsersModule, CardsModule, RatesModule, TransactionsModule],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
