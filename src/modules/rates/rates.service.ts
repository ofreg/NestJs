import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Repository } from 'typeorm';
import { Rate } from './rate.entity';

/**
 * Monobank endpoint returns ARRAY of objects like:
 * { currencyCodeA: number, currencyCodeB: number, date: number, rateBuy?: number, rateSell?: number, rateCross?: number }
 * We only need pairs where currencyCodeB = 980 (UAH), then we normalize to base USD:
 * - 1 USD = usdUah UAH  (from USD/UAH)
 * - for each currency X with X/UAH rate = xUah:
 *      1 USD = (usdUah / xUah) X
 */
type MonoRateRow = {
  currencyCodeA: number;
  currencyCodeB: number;
  date: number;
  rateBuy?: number;
  rateSell?: number;
  rateCross?: number;
};

@Injectable()
export class RatesService {
  private readonly log = new Logger(RatesService.name);

  constructor(
    private readonly cfg: ConfigService,
    @InjectRepository(Rate) private readonly repo: Repository<Rate>,
  ) {}

  async onModuleInit() {
    await this.fetchAndSave();
  }

  @Cron('0 * * * *')
  async hourly() {
    await this.fetchAndSave();
  }

  async fetchAndSave() {
    const url = this.cfg.get<string>('MONOBANK_API_URL') || 'https://api.monobank.ua/bank/currency';
    const base = 'USD';

    const popular = (this.cfg.get<string>('POPULAR_CURRENCIES') || '')
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    const wantedCodes = new Set<string>(['UAH', 'USD', ...popular]);

    try {
      const resp = await axios.get<MonoRateRow[]>(url, { timeout: 15_000 });
      const rows = resp.data || [];

      
      const uahNum = 980;
      const isoToNum = ISO_TO_NUMERIC;
      const numToIso = Object.fromEntries(Object.entries(isoToNum).map(([k, v]) => [String(v), k])) as Record<string, string>;

      const uahPerCurrency: Record<string, number> = {};

      for (const r of rows) {
        if (r.currencyCodeB !== uahNum) continue;

        const iso = numToIso[String(r.currencyCodeA)];
        if (!iso) continue;
        if (!wantedCodes.has(iso)) continue;

        const mid = pickMid(r);
        if (!mid || !Number.isFinite(mid) || mid <= 0) continue;

        uahPerCurrency[iso] = mid;
      }

      const usdUah = uahPerCurrency['USD'];
      if (!usdUah) {
        throw new Error('Monobank response does not contain USD/UAH rate');
      }

      const entries: Array<{ base: string; code: string; value: string }> = [];

     
      entries.push({ base, code: 'USD', value: (1).toFixed(6) });

      entries.push({ base, code: 'UAH', value: usdUah.toFixed(6) });

      
      for (const code of wantedCodes) {
        if (code === 'USD' || code === 'UAH') continue;
        const xUah = uahPerCurrency[code];
        if (!xUah) continue;
        const usdToX = usdUah / xUah;
        if (!Number.isFinite(usdToX) || usdToX <= 0) continue;
        entries.push({ base, code, value: usdToX.toFixed(6) });
      }

      for (const r of entries) {
        await this.repo.upsert({ base: r.base, code: r.code, value: r.value }, ['base', 'code']);
      }

      this.log.log(`Rates updated from Monobank: base=${base}, count=${entries.length}`);
    } catch (e: any) {
      this.log.error(`Rates update failed: ${e?.message || e}`);
    }
  }

  async getRate(base: string, code: string) {
    return this.repo.findOne({ where: { base, code } });
  }

  async list(search?: string) {
    const q = (search || '').trim().toUpperCase();
    const all = await this.repo.find({ order: { code: 'ASC' as any } });
    if (!q) return all;
    return all.filter((r) => r.code.includes(q));
  }


  
  async convertToUah(amount: number, fromCode: string): Promise<{ uah: number; usd: number; rateUahPerUsd: number }> {
    const from = fromCode.toUpperCase();

    const rUah = await this.getRate('USD', 'UAH');
    if (!rUah) throw new Error('Missing USD->UAH rate');
    const rateUahPerUsd = Number(rUah.value);

    if (from === 'UAH') {
      const usd = amount / rateUahPerUsd;
      return { uah: amount, usd, rateUahPerUsd };
    }

    if (from === 'USD') {
      return { uah: amount * rateUahPerUsd, usd: amount, rateUahPerUsd };
    }

    const rFrom = await this.getRate('USD', from);
    if (!rFrom) throw new Error(`Missing USD->${from} rate`);

   
    const usd = amount / Number(rFrom.value);
    const uah = usd * rateUahPerUsd;
    return { uah, usd, rateUahPerUsd };
  }

  async uahToTargetCurrency(
    uah: number,
    targetCode: string,
  ): Promise<{ target: number; usd: number; rateUahPerUsd: number }> {
    const target = targetCode.toUpperCase();

    const rUah = await this.getRate('USD', 'UAH');
    if (!rUah) throw new Error('Missing USD->UAH rate');
    const rateUahPerUsd = Number(rUah.value);

    const usd = uah / rateUahPerUsd;

    if (target === 'USD') return { target: usd, usd, rateUahPerUsd };

    const rTarget = await this.getRate('USD', target);
    if (!rTarget) throw new Error(`Missing USD->${target} rate`);

    const amountTarget = usd * Number(rTarget.value);
    return { target: amountTarget, usd, rateUahPerUsd };
  }
}

function pickMid(r: MonoRateRow): number | null {
  if (typeof r.rateCross === 'number' && r.rateCross > 0) return r.rateCross;
  const buy = typeof r.rateBuy === 'number' ? r.rateBuy : null;
  const sell = typeof r.rateSell === 'number' ? r.rateSell : null;
  if (buy && sell) return (buy + sell) / 2;
  if (buy) return buy;
  if (sell) return sell;
  return null;
}

/**
 * Minimal ISO 4217 code -> numeric code map (covers POPULAR_CURRENCIES default).
 * Extend if you add more currencies in POPULAR_CURRENCIES.
 */
const ISO_TO_NUMERIC: Record<string, number> = {
  UAH: 980,
  USD: 840,
  EUR: 978,
  PLN: 985,
  GBP: 826,
  CHF: 756,
  CZK: 203,
  SEK: 752,
  NOK: 578,
  DKK: 208,
  CAD: 124,
  AUD: 36,
  JPY: 392,
  CNY: 156,
  HUF: 348,
  RON: 946,
  BGN: 975,
  TRY: 949,
  ILS: 376,
  SGD: 702,
  HKD: 344,
  INR: 356,
  KRW: 410,
  THB: 764,
  MXN: 484,
  ZAR: 710,
  BRL: 986,
  AED: 784,
  SAR: 682,
};
