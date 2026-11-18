import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlansController } from './controllers/plans.controller';
import { Plan } from './entities/plan.entity';
import { GetPlanQueryHandler } from './queries/get-plan.query';
import { GetPlansQueryHandler } from './queries/get-plans.query';
import { PlansService } from './services/plans.service';

@Module({
  imports: [TypeOrmModule.forFeature([Plan])],
  controllers: [PlansController],
  providers: [PlansService, GetPlansQueryHandler, GetPlanQueryHandler],
})
export class PlansModule {}
