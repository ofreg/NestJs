import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async createUser(email: string, passwordHash: string) {
    const user = this.repo.create({ email, passwordHash, balanceUah: '0' });
    return this.repo.save(user);
  }

  async setRefreshToken(userId: string, refreshHash: string) {
    await this.repo.update({ id: userId }, { refreshTokenHash: refreshHash });
  }

  async clearRefreshToken(userId: string) {
    await this.repo.update({ id: userId }, { refreshTokenHash: null });
  }

  async addToBalance(userId: string, amountUah: number) {
    const user = await this.repo.findOneOrFail({ where: { id: userId } });
    const current = Number(user.balanceUah);
    user.balanceUah = (current + amountUah).toFixed(2);
    return this.repo.save(user);
  }

  async subtractFromBalance(userId: string, amountUah: number) {
    const user = await this.repo.findOneOrFail({ where: { id: userId } });
    const current = Number(user.balanceUah);
    user.balanceUah = (current - amountUah).toFixed(2);
    return this.repo.save(user);
  }
}
