import { IntegrationsConfig } from '../config/integrations.config';
import { FakePromoProvider } from '../promo/fake-promo-provider';
import {
  PromoProviderUnavailableError,
  PromoRedemptionError,
} from '../promo/promo-provider';

const config: IntegrationsConfig = {
  esimProviderLatencyMs: 0,
  esimProviderMode: 'ok',
  promoProviderMode: 'ok',
};

describe('FakePromoProvider', () => {
  let provider: FakePromoProvider;

  beforeEach(() => {
    provider = new FakePromoProvider(config);
  });

  it('validate returns the seeded discounts', async () => {
    expect(await provider.validate('WELCOME10')).toEqual({
      valid: true,
      percentOff: 10,
    });
    expect(await provider.validate('FREE100')).toEqual({
      valid: true,
      percentOff: 100,
    });
    expect(await provider.validate('NOPE')).toEqual({
      valid: false,
      reason: 'NOT_FOUND',
    });
    expect(await provider.validate('OLD5')).toEqual({
      valid: false,
      reason: 'EXPIRED',
    });
  });

  it('LAST1 validates for two callers but redeems once', async () => {
    expect(await provider.validate('LAST1')).toMatchObject({ valid: true });
    expect(await provider.validate('LAST1')).toMatchObject({ valid: true });

    await expect(provider.redeem('LAST1', 'o1')).resolves.toHaveProperty(
      'redemptionId',
    );
    const second = provider.redeem('LAST1', 'o2');

    await expect(second).rejects.toBeInstanceOf(PromoRedemptionError);
    await expect(second).rejects.toMatchObject({ reason: 'EXHAUSTED' });
    expect(await provider.validate('LAST1')).toEqual({
      valid: false,
      reason: 'EXHAUSTED',
    });
  });

  it('redeem does not dedupe by reference', async () => {
    const first = await provider.redeem('WELCOME10', 'o1');
    const second = await provider.redeem('WELCOME10', 'o1');

    expect(first.redemptionId).not.toBe(second.redemptionId);
  });

  it('rollbackRedemption gives the use back', async () => {
    const { redemptionId } = await provider.redeem('FREE100', 'o1');

    await provider.rollbackRedemption(redemptionId);

    await expect(provider.redeem('FREE100', 'o2')).resolves.toHaveProperty(
      'redemptionId',
    );
  });

  it('unavailable mode rejects every call', async () => {
    const { redemptionId } = await provider.redeem('WELCOME10', 'o1');
    provider.configure({ mode: 'unavailable' });

    await expect(provider.validate('WELCOME10')).rejects.toBeInstanceOf(
      PromoProviderUnavailableError,
    );
    await expect(provider.redeem('WELCOME10', 'o2')).rejects.toBeInstanceOf(
      PromoProviderUnavailableError,
    );
    await expect(
      provider.rollbackRedemption(redemptionId),
    ).rejects.toBeInstanceOf(PromoProviderUnavailableError);
  });

  it('reset restores seeded uses', async () => {
    await provider.redeem('FREE100', 'o1');

    provider.reset();

    expect(await provider.validate('FREE100')).toEqual({
      valid: true,
      percentOff: 100,
    });
  });
});
