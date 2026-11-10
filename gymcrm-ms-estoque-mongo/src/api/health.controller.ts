import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MongoConnection } from '../infrastructure/mongo/mongo.connection';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly mongo: MongoConnection) {}

  @Get()
  @ApiOperation({ summary: 'Liveness/readiness check (includes MongoDB ping)' })
  async health() {
    const database = (await this.mongo.ping()) ? 'up' : 'down';
    return { status: database === 'up' ? 'ok' : 'degraded', database, service: 'ms-estoque-mongo' };
  }
}
