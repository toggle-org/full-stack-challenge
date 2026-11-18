import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { integrationsConfig } from './config/integrations.config';
import { FakeEsimProvider } from './esim-provider/fake-esim-provider';
import { FakePaymentProvider } from './payments/fake-payment-provider';
import { FakePromoProvider } from './promo/fake-promo-provider';
import { ESIM_PROVIDER, PAYMENT_PROVIDER, PROMO_PROVIDER } from './tokens';

@Module({
  imports: [ConfigModule.forFeature(integrationsConfig)],
  providers: [
    { provide: PAYMENT_PROVIDER, useClass: FakePaymentProvider },
    { provide: ESIM_PROVIDER, useClass: FakeEsimProvider },
    { provide: PROMO_PROVIDER, useClass: FakePromoProvider },
  ],
  exports: [PAYMENT_PROVIDER, ESIM_PROVIDER, PROMO_PROVIDER],
})
export class IntegrationsModule {}
