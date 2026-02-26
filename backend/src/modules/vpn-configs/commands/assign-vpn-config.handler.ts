import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { User } from '../../users/user.entity';
import { VpnConfig } from '../vpn-config.entity';
import { AssignVpnConfigCommand } from './assign-vpn-config.command';

@CommandHandler(AssignVpnConfigCommand)
export class AssignVpnConfigHandler implements ICommandHandler<AssignVpnConfigCommand> {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(VpnConfig)
    private readonly vpnConfigsRepository: Repository<VpnConfig>,
  ) {}

  async execute(command: AssignVpnConfigCommand): Promise<VpnConfig> {
    const user = await this.usersRepository.findOne({
      where: { id: command.userId },
      relations: ['assignedVpnConfig'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.assignedVpnConfig) {
      return user.assignedVpnConfig;
    }

    const availableConfig = await this.vpnConfigsRepository.findOne({
      where: { assignedUser: IsNull() },
      order: { createdAt: 'ASC' },
    });

    if (!availableConfig) {
      throw new BadRequestException('No VPN configurations are available');
    }

    availableConfig.assignedUser = user;
    availableConfig.assignedAt = new Date();

    return this.vpnConfigsRepository.save(availableConfig);
  }
}
