import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/user.entity';
import { VpnConfig } from '../vpn-config.entity';
import { GetMyVpnConfigQuery } from './get-my-vpn-config.query';

@QueryHandler(GetMyVpnConfigQuery)
export class GetMyVpnConfigHandler implements IQueryHandler<GetMyVpnConfigQuery> {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async execute(query: GetMyVpnConfigQuery): Promise<VpnConfig | null> {
    const user = await this.usersRepository.findOne({
      where: { id: query.userId },
      relations: ['assignedVpnConfig'],
    });

    return user?.assignedVpnConfig ?? null;
  }
}
