import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CardsModule } from './modules/cards/cards.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { RatesModule } from './modules/rates/rates.module';
import { ExchangeModule } from './modules/exchange/exchange.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { ProfileModule } from './modules/profile/profile.module';
import { User } from './modules/users/user.entity';
import { Card } from './modules/cards/card.entity';
import { Asset } from './modules/wallet/asset.entity';
import { Rate } from './modules/rates/rate.entity';
import { Transaction } from './modules/transactions/transaction.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get<string>('DB_HOST'),
        port: Number(cfg.get<string>('DB_PORT') || 5432),
        username: cfg.get<string>('DB_USERNAME'),
        password: cfg.get<string>('DB_PASSWORD'),
        database: cfg.get<string>('DB_NAME'),
        entities: [User, Card, Asset, Rate, Transaction],
        synchronize: true
      }),
    }),
    UsersModule,
    AuthModule,
    CardsModule,
    WalletModule,
    RatesModule,
    ExchangeModule,
    TransactionsModule,
    ProfileModule,
  ],
})
export class AppModule {}
