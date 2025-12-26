import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class CardCryptoService {
  private readonly key: Buffer;

  constructor(cfg: ConfigService) {
    const hex = cfg.get<string>('CARD_ENCRYPTION_KEY_HEX') || '';
    if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
      throw new Error('CARD_ENCRYPTION_KEY_HEX must be 64 hex chars (32 bytes).');
    }
    this.key = Buffer.from(hex, 'hex');
  }

  encrypt(plain: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
    const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, enc]).toString('base64');
  }

  decrypt(payloadB64: string): string {
    const raw = Buffer.from(payloadB64, 'base64');
    const iv = raw.subarray(0, 12);
    const tag = raw.subarray(12, 28);
    const enc = raw.subarray(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, iv);
    decipher.setAuthTag(tag);
    return decipher.update(enc, undefined, 'utf8') + decipher.final('utf8');
  }
}
