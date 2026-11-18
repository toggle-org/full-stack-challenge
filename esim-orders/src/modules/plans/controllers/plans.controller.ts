import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { PlanView } from '../plan.view';
import { GetPlansQuery } from '../queries/get-plans.query';

@Controller('plans')
export class PlansController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  findAll(): Promise<PlanView[]> {
    return this.queryBus.execute(new GetPlansQuery());
  }
}
