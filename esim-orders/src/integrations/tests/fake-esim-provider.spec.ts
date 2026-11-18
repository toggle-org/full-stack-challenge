import { IntegrationsConfig } from '../config/integrations.config';
import {
  EsimProviderError,
  EsimProviderTimeoutError,
} from '../esim-provider/esim-provider';
import { FakeEsimProvider } from '../esim-provider/fake-esim-provider';

const config: IntegrationsConfig = {
  esimProviderLatencyMs: 0,
  esimProviderMode: 'ok',
  promoProviderMode: 'ok',
};

describe('FakeEsimProvider', () => {
  let provider: FakeEsimProvider;

  beforeEach(() => {
    provider = new FakeEsimProvider(config);
  });

  it('provision returns a 19-digit iccid and records it by reference', async () => {
    const esim = await provider.provision({
      planId: 'eu-5gb',
      reference: 'r1',
    });

    expect(esim.iccid).toMatch(/^8901260\d{12}$/);
    expect(esim.reference).toBe('r1');
    expect(await provider.findByReference('r1')).toHaveLength(1);
  });

  it('provisioning twice with the same reference creates two eSIMs', async () => {
    const first = await provider.provision({
      planId: 'eu-5gb',
      reference: 'r1',
    });
    const second = await provider.provision({
      planId: 'eu-5gb',
      reference: 'r1',
    });

    expect(await provider.findByReference('r1')).toHaveLength(2);
    expect(first.iccid).not.toBe(second.iccid);
  });

  it('timeout_after_success records the eSIM then rejects', async () => {
    provider.configure({ mode: 'timeout_after_success' });

    await expect(
      provider.provision({ planId: 'eu-5gb', reference: 'r1' }),
    ).rejects.toBeInstanceOf(EsimProviderTimeoutError);
    expect(await provider.findByReference('r1')).toHaveLength(1);
  });

  it('fail rejects and records nothing', async () => {
    provider.configure({ mode: 'fail' });

    await expect(
      provider.provision({ planId: 'eu-5gb', reference: 'r1' }),
    ).rejects.toBeInstanceOf(EsimProviderError);
    expect(await provider.findByReference('r1')).toHaveLength(0);
  });

  it('reset clears recorded eSIMs and restores the configured mode', async () => {
    await provider.provision({ planId: 'eu-5gb', reference: 'r1' });
    provider.configure({ mode: 'fail' });

    provider.reset();

    expect(await provider.findByReference('r1')).toHaveLength(0);
    await expect(
      provider.provision({ planId: 'eu-5gb', reference: 'r2' }),
    ).resolves.toMatchObject({ reference: 'r2' });
  });
});
