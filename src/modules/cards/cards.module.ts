import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Card } from './card.entity';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';
import { CardCryptoService } from '../../common/crypto/card-crypto.service';
import { UsersModule } from '../users/users.module';
@Module({
  imports: [TypeOrmModule.forFeature([Card]), ConfigModule, UsersModule],
  controllers: [CardsController],
  providers: [CardsService, CardCryptoService],
  exports: [CardsService],
})
export class CardsModule {}
