import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('plans')
export class Plan {
  @PrimaryColumn({ type: 'varchar', length: 32 })
  id: string;

  @Column({ type: 'varchar', length: 64 })
  name: string;

  @Column({ name: 'data_gb', type: 'int' })
  dataGb: number;

  @Column({ name: 'validity_days', type: 'int' })
  validityDays: number;

  @Column({ name: 'price_cents', type: 'int' })
  priceCents: number;

  @Column({ type: 'varchar', length: 3 })
  currency: string;
}
