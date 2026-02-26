import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsUUID } from 'class-validator';

export class CreatePaymentIntentDto {
  @ApiProperty()
  @IsUUID()
  planId: string;

  @ApiProperty()
  @IsEmail()
  email: string;
}
