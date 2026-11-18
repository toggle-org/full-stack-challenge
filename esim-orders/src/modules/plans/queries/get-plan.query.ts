import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';

import { PlanView, toPlanView } from '../plan.view';
import { PlansService } from '../services/plans.service';

export class GetPlanQuery extends Query<PlanView> {
  constructor(public readonly planId: string) {
    super();
  }
}

@QueryHandler(GetPlanQuery)
export class GetPlanQueryHandler implements IQueryHandler<GetPlanQuery> {
  constructor(private readonly plansService: PlansService) {}

  async execute(query: GetPlanQuery): Promise<PlanView> {
    return toPlanView(await this.plansService.getById(query.planId));
  }
}
