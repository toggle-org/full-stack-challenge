import { randomUUID } from 'crypto';

import { Inject, Injectable } from '@nestjs/common';

import {
  IntegrationsConfig,
  integrationsConfig,
} from '../config/integrations.config';

import {
  PromoProvider,
  PromoProviderMode,
  PromoProviderUnavailableError,
  PromoRedemptionError,
  PromoValidation,
} from './promo-provider';

interface PromoCode {
  percentOff: number;
  remainingUses: number | null;
  expired: boolean;
}

interface Redemption {
  code: string;
  reference: string;
}

const NO_USES_LEFT = 0;

const SEEDED_CODES: Record<string, PromoCode> = {
  WELCOME10: { percentOff: 10, remainingUses: null, expired: false },
  FREE100: { percentOff: 100, remainingUses: 1, expired: false },
  LAST1: { percentOff: 20, remainingUses: 1, expired: false },
  OLD5: { percentOff: 5, remainingUses: null, expired: true },
};

@Injectable()
export class FakePromoProvider implements PromoProvider {
  private codes = new Map<string, PromoCode>();
  private readonly redemptions = new Map<string, Redemption>();
  private mode: PromoProviderMode;

  constructor(
    @Inject(integrationsConfig.KEY) private readonly config: IntegrationsConfig,
  ) {
    this.reset();
  }

  validate(code: string): Promise<PromoValidation> {
    return this.call(() => this.check(code));
  }

  redeem(code: string, reference: string): Promise<{ redemptionId: string }> {
    return this.call(() => {
      const result = this.check(code);
      if (!result.valid) {
        throw new PromoRedemptionError(result.reason);
      }
      const promo = this.codes.get(code) as PromoCode;
      if (promo.remainingUses !== null) {
        promo.remainingUses -= 1;
      }
      const redemptionId = `rdm_${randomUUID()}`;
      this.redemptions.set(redemptionId, { code, reference });
      return { redemptionId };
    });
  }

  rollbackRedemption(redemptionId: string): Promise<void> {
    return this.call(() => {
      const redemption = this.redemptions.get(redemptionId);
      if (!redemption) {
        throw new PromoRedemptionError('NOT_FOUND');
      }
      const promo = this.codes.get(redemption.code) as PromoCode;
      if (promo.remainingUses !== null) {
        promo.remainingUses += 1;
      }
      this.redemptions.delete(redemptionId);
    });
  }

  configure(options: { mode: PromoProviderMode }): void {
    this.mode = options.mode;
  }

  reset(): void {
    this.codes = new Map(
      Object.entries(SEEDED_CODES).map(([code, promo]) => [code, { ...promo }]),
    );
    this.redemptions.clear();
    this.mode = this.config.promoProviderMode;
  }

  private check(code: string): PromoValidation {
    const promo = this.codes.get(code);
    if (!promo) {
      return { valid: false, reason: 'NOT_FOUND' };
    }
    if (promo.expired) {
      return { valid: false, reason: 'EXPIRED' };
    }
    if (promo.remainingUses === NO_USES_LEFT) {
      return { valid: false, reason: 'EXHAUSTED' };
    }
    return { valid: true, percentOff: promo.percentOff };
  }

  private call<T>(operation: () => T): Promise<T> {
    return new Promise((resolve) => {
      if (this.mode === 'unavailable') {
        throw new PromoProviderUnavailableError();
      }
      resolve(operation());
    });
  }
}
