import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from './plan.entity';
import { PlansController } from './plans.controller';
import { GetPlansHandler } from './queries/get-plans.handler';

const queryHandlers = [GetPlansHandler];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([Plan])],
  controllers: [PlansController],
  providers: [...queryHandlers],
  exports: [TypeOrmModule],
})
export class PlansModule {}
