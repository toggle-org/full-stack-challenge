import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../../users/user.entity';
import { VpnConfig } from '../vpn-config.entity';
import { AssignVpnConfigCommand } from './assign-vpn-config.command';
import { AssignVpnConfigHandler } from './assign-vpn-config.handler';

describe('AssignVpnConfigHandler', () => {
  const vpnConfigsFindOneMock = jest.fn();
  const vpnConfigsSaveMock = jest.fn();

  const usersRepository = {
    findOne: jest.fn(),
  } as unknown as Repository<User>;

  const vpnConfigsRepository = {
    findOne: vpnConfigsFindOneMock,
    save: vpnConfigsSaveMock,
  } as unknown as Repository<VpnConfig>;

  const handler = new AssignVpnConfigHandler(
    usersRepository,
    vpnConfigsRepository,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns existing config when user already has one', async () => {
    const existingConfig = {
      id: 'cfg-1',
      configuration: 'existing',
      assignedUser: {} as User,
      assignedAt: new Date(),
      createdAt: new Date(),
    } as VpnConfig;

    usersRepository.findOne = jest.fn().mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      passwordHash: 'hash',
      stripeCustomerId: null,
      createdAt: new Date(),
      subscriptions: [],
      assignedVpnConfig: existingConfig,
    } as User);

    const result = await handler.execute(new AssignVpnConfigCommand('user-1'));

    expect(result).toBe(existingConfig);
    expect(vpnConfigsFindOneMock).not.toHaveBeenCalled();
  });

  it('assigns first available config when user has none', async () => {
    usersRepository.findOne = jest.fn().mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      passwordHash: 'hash',
      stripeCustomerId: null,
      createdAt: new Date(),
      subscriptions: [],
      assignedVpnConfig: null,
    } as User);

    const availableConfig = {
      id: 'cfg-2',
      configuration: 'vpn-config',
      assignedUser: null,
      assignedAt: null,
      createdAt: new Date(),
    } as VpnConfig;

    vpnConfigsFindOneMock.mockResolvedValue(availableConfig);
    vpnConfigsSaveMock.mockImplementation((config: VpnConfig) => config);

    const result = await handler.execute(new AssignVpnConfigCommand('user-1'));

    expect(result.assignedUser?.id).toBe('user-1');
    expect(result.assignedAt).toBeInstanceOf(Date);
    expect(vpnConfigsSaveMock).toHaveBeenCalled();
  });

  it('throws when no available configs remain', async () => {
    usersRepository.findOne = jest.fn().mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      passwordHash: 'hash',
      stripeCustomerId: null,
      createdAt: new Date(),
      subscriptions: [],
      assignedVpnConfig: null,
    } as User);

    vpnConfigsFindOneMock.mockResolvedValue(null);

    await expect(
      handler.execute(new AssignVpnConfigCommand('user-1')),
    ).rejects.toThrow(BadRequestException);
  });
});
