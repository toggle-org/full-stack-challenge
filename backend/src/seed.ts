import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { Repository } from 'typeorm';
import { AppModule } from './app.module';
import { Plan } from './modules/plans/plan.entity';
import { VpnConfig } from './modules/vpn-configs/vpn-config.entity';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const plansRepository: Repository<Plan> = dataSource.getRepository(Plan);
  const vpnConfigsRepository: Repository<VpnConfig> =
    dataSource.getRepository(VpnConfig);

  const existingPlans = await plansRepository.count();
  if (existingPlans === 0) {
    const plans = plansRepository.create([
      {
        name: 'Starter',
        description: 'Secure browsing on 1 device. Great for personal usage.',
        priceCents: 999,
        currency: 'usd',
        stripePriceId: process.env.STRIPE_PRICE_ID_STARTER ?? 'price_starter',
      },
      {
        name: 'Pro',
        description: 'Fast encrypted tunnel on up to 5 devices.',
        priceCents: 1999,
        currency: 'usd',
        stripePriceId: process.env.STRIPE_PRICE_ID_PRO ?? 'price_pro',
      },
      {
        name: 'Ultimate',
        description: 'Top performance and global locations for teams.',
        priceCents: 2999,
        currency: 'usd',
        stripePriceId: process.env.STRIPE_PRICE_ID_ULTIMATE ?? 'price_ultimate',
      },
    ]);

    await plansRepository.save(plans);
    console.log('Seeded plans');
  }

  const existingConfigs = await vpnConfigsRepository.count();
  const targetConfigs = 1000;

  if (existingConfigs < targetConfigs) {
    const rowsToCreate = targetConfigs - existingConfigs;
    const configs = Array.from({ length: rowsToCreate }, (_, index) =>
      vpnConfigsRepository.create({
        configuration: `[Interface]\nPrivateKey = VPN_PRIVATE_KEY_${existingConfigs + index + 1}\nAddress = 10.0.${Math.floor((existingConfigs + index + 1) / 255)}.${(existingConfigs + index + 1) % 255 || 1}/24\n\n[Peer]\nPublicKey = VPN_SERVER_PUBLIC_KEY\nEndpoint = vpn.example.com:51820\nAllowedIPs = 0.0.0.0/0, ::/0`,
      }),
    );

    await vpnConfigsRepository.save(configs);
    console.log(`Seeded ${rowsToCreate} VPN configurations`);
  }

  await app.close();
}

void seed();
