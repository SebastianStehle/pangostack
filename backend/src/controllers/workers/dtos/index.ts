import { ApiProperty } from '@nestjs/swagger';
import { Worker } from 'src/domain/workers';

export class WorkerDto {
  @ApiProperty({
    description: 'The endpoint of the worker.',
    required: true,
  })
  endpoint: string;

  @ApiProperty({
    description: 'Indicates if the worker can be reached.',
    required: true,
  })
  isReady: boolean;

  static fromDomain(source: Worker): WorkerDto {
    const result = new WorkerDto();
    result.endpoint = source.endpoint;
    result.isReady = source.isReady;
    return result;
  }
}

export class WorkersDto {
  @ApiProperty({
    description: 'The workers.',
    required: true,
    type: [WorkerDto],
  })
  items: WorkerDto[];

  static fromDomain(source: Worker[]): WorkersDto {
    const result = new WorkersDto();
    result.items = source.map(WorkerDto.fromDomain);
    return result;
  }
}
