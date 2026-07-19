import { ApiProperty } from '@nestjs/swagger';
import { TeamActivity, TeamActivityUser } from 'src/domain/activities';

export class ActivityUserDto {
  @ApiProperty({
    description: 'The user ID from the auth provider.',
    required: true,
  })
  id: string;

  @ApiProperty({
    description: 'The display name.',
    required: true,
  })
  name: string;

  @ApiProperty({
    description: 'The email address.',
    required: true,
  })
  email: string;

  static fromDomain(source: TeamActivityUser): ActivityUserDto {
    const result = new ActivityUserDto();
    result.id = source.id;
    result.name = source.name;
    result.email = source.email;
    return result;
  }
}

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
    description: 'The ID of the deployment the activity relates to, or null for team wide activities.',
    nullable: true,
    type: Number,
  })
  deploymentId?: number | null;

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
    type: ActivityUserDto,
  })
  createdBy?: ActivityUserDto | null;

  static fromDomain(source: TeamActivity): ActivityDto {
    const result = new ActivityDto();
    result.id = source.id;
    result.key = source.key;
    result.text = source.text;
    result.deploymentId = source.deploymentId;
    result.createdAt = source.createdAt;
    result.createdBy = source.createdBy ? ActivityUserDto.fromDomain(source.createdBy) : null;
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
