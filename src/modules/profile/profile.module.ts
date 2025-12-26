import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { CardsModule } from '../cards/cards.module';
import { WalletModule } from '../wallet/wallet.module';
import { ProfileController } from './profile.controller';

@Module({
  imports: [UsersModule, CardsModule, WalletModule],
  controllers: [ProfileController],
})
export class ProfileModule {}
