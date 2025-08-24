import { Controller, Get, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard, Role, RoleGuard } from 'src/domain/auth';
import { BUILTIN_USER_GROUP_ADMIN } from 'src/domain/database';
import { GetWorkersQuery } from 'src/domain/workers';
import { WorkersDto } from './dtos';

@Controller('api/workers')
@ApiTags('workers')
@ApiSecurity('x-api-key')
@UseGuards(LocalAuthGuard)
export class WorkersController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('')
  @ApiOperation({ operationId: 'getWorkers', description: 'Gets the workers.' })
  @ApiOkResponse({ type: WorkersDto })
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(RoleGuard)
  async getWorkers() {
    const { workers } = await this.queryBus.execute(new GetWorkersQuery());

    return WorkersDto.fromDomain(workers);
  }
}
