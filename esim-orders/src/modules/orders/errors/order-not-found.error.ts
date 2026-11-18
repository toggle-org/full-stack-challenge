import { NotFoundException } from '@nestjs/common';

export class OrderNotFoundError extends NotFoundException {
  constructor(reference: string) {
    super(`Order ${reference} not found`);
  }
}
