import { Plan } from './entities/plan.entity';

export interface PlanView {
  id: string;
  name: string;
  dataGb: number;
  validityDays: number;
  priceCents: number;
  currency: string;
}

export function toPlanView(plan: Plan): PlanView {
  return {
    id: plan.id,
    name: plan.name,
    dataGb: plan.dataGb,
    validityDays: plan.validityDays,
    priceCents: plan.priceCents,
    currency: plan.currency,
  };
}
