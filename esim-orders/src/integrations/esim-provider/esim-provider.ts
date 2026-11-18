export type EsimProviderMode = 'ok' | 'timeout_after_success' | 'fail';

export interface ProvisionedEsim {
  iccid: string;
  activationCode: string;
  reference: string;
}

export interface EsimProvider {
  provision(request: {
    planId: string;
    reference: string;
  }): Promise<ProvisionedEsim>;
  findByReference(reference: string): Promise<ProvisionedEsim[]>;
}

export class EsimProviderTimeoutError extends Error {}

export class EsimProviderError extends Error {}
