import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Plan } from './plan.entity';
import { GetPlansQuery } from './queries/get-plans.query';

@ApiTags('plans')
@Controller('plans')
export class PlansController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOkResponse({ type: [Plan] })
  async getPlans(): Promise<Plan[]> {
    return this.queryBus.execute(new GetPlansQuery());
  }
}
