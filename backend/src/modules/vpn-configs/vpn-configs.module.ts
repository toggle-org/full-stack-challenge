import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { User } from '../users/user.entity';
import { AssignVpnConfigHandler } from './commands/assign-vpn-config.handler';
import { GetMyVpnConfigHandler } from './queries/get-my-vpn-config.handler';
import { VpnConfig } from './vpn-config.entity';
import { VpnConfigsController } from './vpn-configs.controller';

const commandHandlers = [AssignVpnConfigHandler];
const queryHandlers = [GetMyVpnConfigHandler];

@Module({
  imports: [CqrsModule, AuthModule, TypeOrmModule.forFeature([User, VpnConfig])],
  controllers: [VpnConfigsController],
  providers: [...commandHandlers, ...queryHandlers],
})
export class VpnConfigsModule {}
