export interface Plan {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  stripePriceId: string;
}

export interface VpnConfig {
  id: string;
  configuration: string;
  assignedAt: string | null;
}
