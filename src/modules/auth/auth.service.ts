import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { StringValue } from 'ms';
import { COOKIE_ACCESS, COOKIE_REFRESH } from '../../common/constants';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly cfg: ConfigService,
  ) {}

  async register(email: string, password: string) {
    const existing = await this.users.findByEmail(email);
    if (existing) throw new BadRequestException('Email already exists');

    const saltRounds = Number(this.cfg.get<string>('BCRYPT_SALT_ROUNDS') ?? 10);
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await this.users.createUser(email, passwordHash);
    return { id: user.id, email: user.email };
  }

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const accessToken = await this.signAccess(user.id, user.email);
    const refreshToken = await this.signRefresh(user.id);

    await this.users.setRefreshToken(
      user.id,
      await this.hashRefresh(refreshToken),
    );

    return { accessToken, refreshToken, user };
  }

  async refresh(refreshToken?: string) {
    if (!refreshToken)
      throw new UnauthorizedException('Missing refresh token');

    const payload = await this.verifyRefresh(refreshToken);
    const user = await this.users.findById(payload.sub);

    if (!user || !user.refreshTokenHash)
      throw new ForbiddenException('Refresh forbidden');

    const matches = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash,
    );
    if (!matches) throw new ForbiddenException('Refresh forbidden');

    const newAccess = await this.signAccess(user.id, user.email);
    const newRefresh = await this.signRefresh(user.id);

    await this.users.setRefreshToken(
      user.id,
      await this.hashRefresh(newRefresh),
    );

    return { accessToken: newAccess, refreshToken: newRefresh };
  }

  async logout(refreshToken?: string) {
    if (!refreshToken) return;

    try {
      const payload = await this.verifyRefresh(refreshToken);
      await this.users.clearRefreshToken(payload.sub);
    } catch {
      // ignore invalid token
    }
  }

  setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    const isProd =
      (this.cfg.get<string>('NODE_ENV') ?? 'development') === 'production';

    res.cookie(COOKIE_ACCESS, accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      maxAge: this.parseMs(
        (this.cfg.get<string>('JWT_ACCESS_EXPIRES_IN') as StringValue) ??
          '20m',
      ),
      path: '/',
    });

    res.cookie(COOKIE_REFRESH, refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      maxAge: this.parseMs(
        (this.cfg.get<string>('JWT_REFRESH_EXPIRES_IN') as StringValue) ??
          '14d',
      ),
      path: '/auth/refresh',
    });
  }

  private async signAccess(userId: string, email: string) {
    const secret =
      this.cfg.get<string>('JWT_ACCESS_SECRET') ?? 'change_me_access';

    const expiresIn =
      (this.cfg.get<string>('JWT_ACCESS_EXPIRES_IN') as StringValue) ?? '20m';

    return this.jwt.signAsync(
      { sub: userId, email, type: 'access' },
      { secret, expiresIn },
    );
  }

  private async signRefresh(userId: string) {
    const secret =
      this.cfg.get<string>('JWT_REFRESH_SECRET') ?? 'change_me_refresh';

    const expiresIn =
      (this.cfg.get<string>('JWT_REFRESH_EXPIRES_IN') as StringValue) ?? '14d';

    return this.jwt.signAsync(
      { sub: userId, type: 'refresh' },
      { secret, expiresIn },
    );
  }

  private async verifyRefresh(
    token: string,
  ): Promise<{ sub: string; type: string }> {
    const secret =
      this.cfg.get<string>('JWT_REFRESH_SECRET') ?? 'change_me_refresh';

    try {
      return await this.jwt.verifyAsync(token, { secret });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async hashRefresh(token: string) {
    const saltRounds = Number(this.cfg.get<string>('BCRYPT_SALT_ROUNDS') ?? 10);
    return bcrypt.hash(token, saltRounds);
  }

  private parseMs(ttl: string): number {
    // supports: 20m, 14d, 3600s
    const m = /^(\d+)\s*([smhd])$/.exec(ttl.trim());
    if (!m) return 0;

    const n = Number(m[1]);
    const unit = m[2];
    const mult =
      unit === 's'
        ? 1_000
        : unit === 'm'
        ? 60_000
        : unit === 'h'
        ? 3_600_000
        : 86_400_000;

    return n * mult;
  }
}
