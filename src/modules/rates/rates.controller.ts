import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RatesService } from './rates.service';

@ApiTags('rates')
@Controller('rates')
@UseGuards(JwtAuthGuard)
export class RatesController {
  constructor(private readonly rates: RatesService) {}

  @Get()
  async list(@Query('search') search?: string) {
    const items = await this.rates.list(search);
    return items.map((r) => ({ code: r.code, base: r.base, value: r.value }));
  }
}
