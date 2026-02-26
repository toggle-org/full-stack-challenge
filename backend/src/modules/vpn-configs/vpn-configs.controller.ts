import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/current-user.decorator';
import type { CurrentUserPayload } from '../../common/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AssignVpnConfigCommand } from './commands/assign-vpn-config.command';
import { GetMyVpnConfigQuery } from './queries/get-my-vpn-config.query';
import { VpnConfig } from './vpn-config.entity';

@ApiTags('vpn-configs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vpn-configs')
export class VpnConfigsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('me')
  @ApiOkResponse({ type: VpnConfig })
  async getMyConfig(
    @CurrentUser() currentUser: CurrentUserPayload,
  ): Promise<VpnConfig | null> {
    return this.queryBus.execute(new GetMyVpnConfigQuery(currentUser.userId));
  }

  @Post('assign')
  @ApiOkResponse({ type: VpnConfig })
  async assignConfig(
    @CurrentUser() currentUser: CurrentUserPayload,
  ): Promise<VpnConfig> {
    return this.commandBus.execute(
      new AssignVpnConfigCommand(currentUser.userId),
    );
  }
}
