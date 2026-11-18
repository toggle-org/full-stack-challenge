import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';

import { PlanView, toPlanView } from '../plan.view';
import { PlansService } from '../services/plans.service';

export class GetPlansQuery extends Query<PlanView[]> {}

@QueryHandler(GetPlansQuery)
export class GetPlansQueryHandler implements IQueryHandler<GetPlansQuery> {
  constructor(private readonly plansService: PlansService) {}

  async execute(): Promise<PlanView[]> {
    const plans = await this.plansService.findAll();
    return plans.map(toPlanView);
  }
}
