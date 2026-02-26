import { ApiProperty } from '@nestjs/swagger';

export class PlanDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  priceCents: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  stripePriceId: string;
}
