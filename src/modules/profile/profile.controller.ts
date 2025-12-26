import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/user.decorator';
import { UsersService } from '../users/users.service';
import { CardsService } from '../cards/cards.service';
import { WalletService } from '../wallet/wallet.service';

@ApiTags('profile')
@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(
    private readonly users: UsersService,
    private readonly cards: CardsService,
    private readonly wallet: WalletService,
  ) {}

  @Get()
  async me(@CurrentUser() u: { userId: string }) {
    const user = await this.users.findById(u.userId);
    const cards = await this.cards.listForUser(u.userId);
    const assets = await this.wallet.listAssets(u.userId);

    return {
      email: user?.email,
      balanceUah: user?.balanceUah,
      cards: cards.map((c) => ({ id: c.id, last4: c.last4 })),
      assets,
    };
  }
}
