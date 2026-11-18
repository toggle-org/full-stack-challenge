import { randomInt, randomUUID } from 'crypto';

import { Inject, Injectable } from '@nestjs/common';

import {
  IntegrationsConfig,
  integrationsConfig,
} from '../config/integrations.config';

import {
  EsimProvider,
  EsimProviderError,
  EsimProviderMode,
  EsimProviderTimeoutError,
  ProvisionedEsim,
} from './esim-provider';

const ICCID_PREFIX = '8901260';
const ICCID_SERIAL_DIGITS = 12;
const ICCID_SERIAL_RANGE = 1_000_000_000_000;

@Injectable()
export class FakeEsimProvider implements EsimProvider {
  private readonly esims = new Map<string, ProvisionedEsim[]>();
  private latencyMs: number;
  private mode: EsimProviderMode;

  constructor(
    @Inject(integrationsConfig.KEY) private readonly config: IntegrationsConfig,
  ) {
    this.reset();
  }

  async provision(request: {
    planId: string;
    reference: string;
  }): Promise<ProvisionedEsim> {
    await new Promise((resolve) => setTimeout(resolve, this.latencyMs));
    if (this.mode === 'fail') {
      throw new EsimProviderError(
        `eSIM provider rejected plan ${request.planId}`,
      );
    }
    const esim: ProvisionedEsim = {
      iccid: `${ICCID_PREFIX}${randomInt(ICCID_SERIAL_RANGE).toString().padStart(ICCID_SERIAL_DIGITS, '0')}`,
      activationCode: `LPA:1$smdp.example.com$${randomUUID()}`,
      reference: request.reference,
    };
    this.esims.set(request.reference, [
      ...(this.esims.get(request.reference) ?? []),
      esim,
    ]);
    if (this.mode === 'timeout_after_success') {
      throw new EsimProviderTimeoutError('eSIM provider timed out');
    }
    return esim;
  }

  findByReference(reference: string): Promise<ProvisionedEsim[]> {
    return Promise.resolve([...(this.esims.get(reference) ?? [])]);
  }

  configure(options: { latencyMs?: number; mode?: EsimProviderMode }): void {
    this.latencyMs = options.latencyMs ?? this.latencyMs;
    this.mode = options.mode ?? this.mode;
  }

  reset(): void {
    this.esims.clear();
    this.latencyMs = this.config.esimProviderLatencyMs;
    this.mode = this.config.esimProviderMode;
  }
}
