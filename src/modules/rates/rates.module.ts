import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Rate } from './rate.entity';
import { RatesController } from './rates.controller';
import { RatesService } from './rates.service';

@Module({
  imports: [TypeOrmModule.forFeature([Rate]), ConfigModule],
  controllers: [RatesController],
  providers: [RatesService],
  exports: [RatesService],
})
export class RatesModule {}
