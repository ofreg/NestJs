import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardCryptoService } from '../../common/crypto/card-crypto.service';
import { User } from '../users/user.entity';
import { Card } from './card.entity';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card) private readonly repo: Repository<Card>,
    private readonly crypto: CardCryptoService,
  ) {}

  listForUser(userId: string) {
    return this.repo.find({ where: { user: { id: userId } }, order: { createdAt: 'DESC' } as any });
  }

  async addCard(user: User, cardNumber: string, expMonth: number, expYear: number) {
    const encrypted = this.crypto.encrypt(cardNumber);
    const last4 = cardNumber.slice(-4);
    const card = this.repo.create({ user, encryptedNumber: encrypted, last4, expMonth, expYear });
    return this.repo.save(card);
  }
}
