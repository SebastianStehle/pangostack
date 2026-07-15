import { ApiProperty } from '@nestjs/swagger';
import { TeamActivity } from 'src/domain/activities';

export class ActivityDto {
  @ApiProperty({
    description: 'The ID of the activity.',
    required: true,
  })
  id: number;

  @ApiProperty({
    description: 'The key that identifies the type of the activity.',
    required: true,
  })
  key: string;

  @ApiProperty({
    description: 'The already translated, human readable text of the activity.',
    required: true,
  })
  text: string;

  @ApiProperty({
    description: 'The date the activity has been logged.',
    required: true,
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The user that caused the activity, or null for system activities.',
    nullable: true,
    type: String,
  })
  createdBy?: string | null;

  static fromDomain(source: TeamActivity): ActivityDto {
    const result = new ActivityDto();
    result.id = source.id;
    result.key = source.key;
    result.text = source.text;
    result.createdAt = source.createdAt;
    result.createdBy = source.createdBy;
    return result;
  }
}

export class ActivitiesDto {
  @ApiProperty({
    description: 'The activities.',
    required: true,
    type: [ActivityDto],
  })
  items: ActivityDto[];

  @ApiProperty({
    description: 'The total number of activities.',
    required: true,
  })
  total: number;

  static fromDomain(source: TeamActivity[], total: number): ActivitiesDto {
    const result = new ActivitiesDto();
    result.items = source.map(ActivityDto.fromDomain);
    result.total = total;
    return result;
  }
}
