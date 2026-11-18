import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

import { EsimProviderMode } from '../esim-provider/esim-provider';
import { PromoProviderMode } from '../promo/promo-provider';

const DEFAULT_ESIM_PROVIDER_LATENCY_MS = 4000;

export interface IntegrationsConfig {
  esimProviderLatencyMs: number;
  esimProviderMode: EsimProviderMode;
  promoProviderMode: PromoProviderMode;
}

interface IntegrationsEnv {
  ESIM_PROVIDER_LATENCY_MS: number;
  ESIM_PROVIDER_MODE: EsimProviderMode;
  PROMO_PROVIDER_MODE: PromoProviderMode;
}

const schema = Joi.object<IntegrationsEnv>({
  ESIM_PROVIDER_LATENCY_MS: Joi.number()
    .integer()
    .default(DEFAULT_ESIM_PROVIDER_LATENCY_MS),
  ESIM_PROVIDER_MODE: Joi.string()
    .valid('ok', 'timeout_after_success', 'fail')
    .default('ok'),
  PROMO_PROVIDER_MODE: Joi.string().valid('ok', 'unavailable').default('ok'),
});

export const integrationsConfig = registerAs(
  'integrations',
  (): IntegrationsConfig => {
    const result = schema.validate(process.env, { allowUnknown: true });
    if (result.error) {
      throw result.error;
    }
    const value = result.value;
    return {
      esimProviderLatencyMs: value.ESIM_PROVIDER_LATENCY_MS,
      esimProviderMode: value.ESIM_PROVIDER_MODE,
      promoProviderMode: value.PROMO_PROVIDER_MODE,
    };
  },
);
