import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/user.decorator';
import { ExchangeDto } from './dto/exchange.dto';
import { ExchangeService } from './exchange.service';

@ApiTags('exchange')
@Controller('exchange')
@UseGuards(JwtAuthGuard)
export class ExchangeController {
  constructor(private readonly ex: ExchangeService) {}

  @Post('buy')
  async buy(@CurrentUser() u: { userId: string }, @Body() dto: ExchangeDto) {
    return this.ex.buy(u.userId, dto.currency, dto.amount);
  }

  @Post('sell')
  async sell(@CurrentUser() u: { userId: string }, @Body() dto: ExchangeDto) {
    return this.ex.sell(u.userId, dto.currency, dto.amount);
  }
}
