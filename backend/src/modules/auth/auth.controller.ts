import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { LoginCommand } from './commands/login.command';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('login')
  @ApiOkResponse({
    schema: {
      properties: {
        accessToken: { type: 'string' },
      },
    },
  })
  async login(@Body() dto: LoginDto): Promise<{ accessToken: string }> {
    return this.commandBus.execute(new LoginCommand(dto.email, dto.password));
  }
}
