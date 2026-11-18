import { NotFoundException } from '@nestjs/common';

export class PlanNotFoundError extends NotFoundException {
  constructor(planId: string) {
    super(`Plan ${planId} not found`);
  }
}
