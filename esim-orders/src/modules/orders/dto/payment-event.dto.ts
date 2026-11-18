import { Type } from 'class-transformer';
import {
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';

import { PaymentEventType } from '../payment-event-type';

export class PaymentEventDataDto {
  @IsString()
  @IsNotEmpty()
  paymentIntentId: string;
}

export class PaymentEventDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsEnum(PaymentEventType)
  type: PaymentEventType;

  @IsDefined()
  @IsObject()
  @ValidateNested()
  @Type(() => PaymentEventDataDto)
  data: PaymentEventDataDto;
}
