import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Plan } from '../entities/plan.entity';
import { PlanNotFoundError } from '../errors/plan-not-found.error';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(Plan) private readonly plans: Repository<Plan>,
  ) {}

  findAll(): Promise<Plan[]> {
    return this.plans.find({ order: { priceCents: 'ASC' } });
  }

  async getById(planId: string): Promise<Plan> {
    const plan = await this.plans.findOneBy({ id: planId });
    if (!plan) {
      throw new PlanNotFoundError(planId);
    }
    return plan;
  }
}
