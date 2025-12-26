import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { COOKIE_ACCESS } from '../../common/constants';

function cookieExtractor(req: Request): string | null {
  return req?.cookies?.[COOKIE_ACCESS] || null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(cfg: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      ignoreExpiration: false,
      secretOrKey: cfg.get<string>('JWT_ACCESS_SECRET') || 'change_me_access',
    });
  }

  async validate(payload: any) {
    if (!payload?.sub || payload?.type !== 'access') {
      throw new UnauthorizedException();
    }
    return { userId: payload.sub, email: payload.email };
  }
}
