import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  EsimProvider,
  ProvisionedEsim,
} from '../../../integrations/esim-provider/esim-provider';
import { ESIM_PROVIDER } from '../../../integrations/tokens';
import { Esim } from '../entities/esim.entity';

@Injectable()
export class EsimService {
  private readonly logger = new Logger(EsimService.name);

  constructor(
    @InjectRepository(Esim) private readonly esims: Repository<Esim>,
    @Inject(ESIM_PROVIDER) private readonly provider: EsimProvider,
  ) {}

  async provision(orderId: string, planId: string): Promise<Esim> {
    this.logger.log(`provisioning esim order=${orderId} plan=${planId}`);
    let provisioned: ProvisionedEsim;
    try {
      provisioned = await this.provider.provision({
        planId,
        reference: orderId,
      });
    } catch (error) {
      this.logger.error(
        `provisioning failed order=${orderId} error=${(error as Error).message}`,
      );
      throw error;
    }
    const esim = await this.esims.save(
      this.esims.create({
        orderId,
        iccid: provisioned.iccid,
        activationCode: provisioned.activationCode,
      }),
    );
    this.logger.log(`esim provisioned order=${orderId} iccid=${esim.iccid}`);
    return esim;
  }

  findByOrderId(orderId: string): Promise<Esim | null> {
    return this.esims.findOne({
      where: { orderId },
      order: { createdAt: 'ASC' },
    });
  }
}
