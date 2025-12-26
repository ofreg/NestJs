import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ValidationErrorsDto } from '../../common/errors/validation-error.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/user.decorator';
import { UseGuards } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AddCardDto } from './dto/add-card.dto';
import { CardsService } from './cards.service';

@ApiTags('cards')
@Controller('cards')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CardsController {
  constructor(private readonly cards: CardsService, private readonly users: UsersService) {}

  @Get()
  async list(@CurrentUser() u: { userId: string }) {
    const items = await this.cards.listForUser(u.userId);
    return items.map((c) => ({ id: c.id, last4: c.last4 }));
  }

  @Post()
  @ApiOkResponse({ description: 'Card added' })
  @ApiOkResponse({ type: ValidationErrorsDto, description: 'Validation errors' })
  async add(@CurrentUser() u: { userId: string }, @Body() dto: AddCardDto) {
    const errors = validateCard(dto.cardNumber, dto.cvv, dto.expiry);
    if (errors.length) return { errors };

    const user = await this.users.findById(u.userId);
    if (!user) return { errors: [{ field: 'user', type: 'not_found', message: 'User not found' }] };

    const { month, year } = parseExpiry(dto.expiry);
    const card = await this.cards.addCard(user as any, dto.cardNumber, month, year);
    return { id: card.id, last4: card.last4 };
  }
}

function validateCard(cardNumber: string, cvv: string, expiry: string) {
  const errors: Array<{ field: string; type: string; message: string }> = [];

  if (!/^\d{16}$/.test(cardNumber || '')) {
    errors.push({ field: 'cardNumber', type: 'format', message: 'Card number must be exactly 16 digits' });
  }

  if (!/^\d{3}$/.test(cvv || '')) {
    errors.push({ field: 'cvv', type: 'format', message: 'CVV must be exactly 3 digits' });
  }

  if (!/^\d{2}\/\d{2}$/.test(expiry || '')) {
    errors.push({ field: 'expiry', type: 'format', message: 'Expiry must be in MM/YY format' });
  } else {
    const { month, year } = parseExpiry(expiry);
    if (month < 1 || month > 12) {
      errors.push({ field: 'expiry', type: 'month', message: 'Expiry month must be between 01 and 12' });
    } else if (year < 0 || year > 99) {
      errors.push({ field: 'expiry', type: 'year', message: 'Expiry year must be 00-99 (two digits)' });
    } else {
      const now = new Date();
      const currentYY = now.getFullYear() % 100;
      const currentMM = now.getMonth() + 1;
      if (year < currentYY || (year === currentYY && month < currentMM)) {
        errors.push({ field: 'expiry', type: 'expired', message: 'Card is expired' });
      }
    }
  }

  return errors;
}

function parseExpiry(expiry: string): { month: number; year: number } {
  const [mm, yy] = expiry.split('/');
  return { month: Number(mm), year: Number(yy) };
}
