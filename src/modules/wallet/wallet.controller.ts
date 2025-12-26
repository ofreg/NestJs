import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/user.decorator';
import { DepositDto } from './dto/deposit.dto';
import { WalletService } from './wallet.service';

@ApiTags('wallet')
@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly wallet: WalletService) {}

  @Get('assets')
  async assets(@CurrentUser() u: { userId: string }) {
    return this.wallet.listAssets(u.userId);
  }

  @Post('deposit')
  async deposit(@CurrentUser() u: { userId: string }, @Body() dto: DepositDto) {
    return this.wallet.deposit(u.userId, dto.cardId, dto.amount, dto.currency);
  }
}
