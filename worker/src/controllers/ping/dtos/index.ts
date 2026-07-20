import { ApiProperty } from '@nestjs/swagger';

export class PingResultDto {
  @ApiProperty({
    description: 'The timestamp when the worker has been started.',
    required: true,
  })
  startedAt: string;

  @ApiProperty({
    description: 'The names of the resource types that the worker provides.',
    required: true,
    type: [String],
  })
  resourceTypes: string[];
}
