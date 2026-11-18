export type PromoProviderMode = 'ok' | 'unavailable';

export type PromoRejectionReason = 'NOT_FOUND' | 'EXPIRED' | 'EXHAUSTED';

export type PromoValidation =
  | { valid: true; percentOff: number }
  | { valid: false; reason: PromoRejectionReason };

export interface PromoProvider {
  validate(code: string): Promise<PromoValidation>;
  redeem(code: string, reference: string): Promise<{ redemptionId: string }>;
  rollbackRedemption(redemptionId: string): Promise<void>;
}

export class PromoRedemptionError extends Error {
  constructor(readonly reason: PromoRejectionReason) {
    super(`Promo code rejected: ${reason}`);
  }
}

export class PromoProviderUnavailableError extends Error {
  constructor() {
    super('Promo service is unavailable');
  }
}
