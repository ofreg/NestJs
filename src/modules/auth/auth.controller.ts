import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { COOKIE_ACCESS, COOKIE_REFRESH } from '../../common/constants';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @ApiOkResponse({ description: 'Registered' })
  async register(@Body() dto: RegisterDto) {
    return this.auth.register(dto.email, dto.password);
  }

  @Post('login')
  @ApiOkResponse({ description: 'Logged in, tokens set in HttpOnly cookies' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, user } = await this.auth.login(dto.email, dto.password);
    this.auth.setAuthCookies(res, accessToken, refreshToken);
    return { user: { id: user.id, email: user.email } };
  }

  @Post('refresh')
  @ApiOkResponse({ description: 'Rotates tokens using refresh cookie' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.[COOKIE_REFRESH];
    const { accessToken, refreshToken } = await this.auth.refresh(token);
    this.auth.setAuthCookies(res, accessToken, refreshToken);
    return { ok: true };
  }

  @Post('logout')
  @ApiOkResponse({ description: 'Clears auth cookies' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.[COOKIE_REFRESH];
    await this.auth.logout(token);
    res.clearCookie(COOKIE_ACCESS);
    res.clearCookie(COOKIE_REFRESH);
    return { ok: true };
  }
}
