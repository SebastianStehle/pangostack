import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDefined, IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { Team, TeamUser, User, UserGroup } from 'src/domain/users';

export class UpsertUserDto {
  @ApiProperty({
    description: 'The display name.',
    required: true,
  })
  @IsDefined()
  @IsString()
  @Length(0, 100)
  name: string;

  @ApiProperty({
    description: 'The email address.',
    required: true,
  })
  @IsDefined()
  @IsString()
  @Length(0, 100)
  email: string;

  @ApiProperty({
    description: 'The user roles.',
    nullable: true,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];

  @ApiProperty({
    description: 'The optional password.',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  password?: string | null;

  @ApiProperty({
    description: 'The user group ID.',
    required: true,
  })
  @IsDefined()
  @IsString()
  userGroupId: string;

  @ApiProperty({
    description: 'The API Key.',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  apiKey?: string | null;
}

export class UserDto {
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

  @ApiProperty({
    description: ' The URL to an external picture.',
    nullable: true,
    type: String,
  })
  picture?: string | null;

  @ApiProperty({
    description: 'The API Key.',
    nullable: true,
    type: String,
  })
  apiKey?: string | null;

  @ApiProperty({
    description: 'The user roles.',
    nullable: true,
    type: [String],
  })
  roles?: string[] | null;

  @ApiProperty({
    description: 'The user group ID.',
    required: true,
  })
  userGroupId: string;

  @ApiProperty({
    description: 'Indicates if the user has a password configured.',
    required: true,
  })
  hasPassword: boolean;

  static fromDomain(source: User) {
    const result = new UserDto();
    result.id = source.id;
    result.apiKey = source.apiKey;
    result.email = source.email;
    result.hasPassword = !!source.hasPassword;
    result.name = source.name;
    result.roles = source.roles;
    result.userGroupId = source.userGroupId;
    return result;
  }
}

export class UsersDto {
  @ApiProperty({
    description: 'The users.',
    required: true,
    type: [UserDto],
  })
  items: UserDto[];

  @ApiProperty({
    description: 'The total number of users.',
    required: true,
  })
  total: number;

  static fromDomain(source: User[], total: number) {
    const result = new UsersDto();
    result.total = total;
    result.items = source.map(UserDto.fromDomain);
    return result;
  }
}

export class UpsertUserGroupDto {
  @ApiProperty({
    description: 'The display name.',
    required: true,
    maxLength: 100,
  })
  @IsDefined()
  @IsString()
  @MaxLength(100)
  name: string;
}

export class UserGroupDto {
  @ApiProperty({
    description: 'The ID of the user group.',
    required: true,
  })
  id: string;

  @ApiProperty({
    description: 'The display name.',
    required: true,
  })
  name: string;

  @ApiProperty({
    description: 'Indicates if the users are admins.',
    required: true,
  })
  isAdmin: boolean;

  @ApiProperty({
    description: 'Indicates if the user group is builtin and cannot be deleted.',
    required: true,
  })
  isBuiltIn: boolean;

  static fromDomain(source: UserGroup) {
    const result = new UserGroupDto();
    result.id = source.id;
    result.isAdmin = source.isAdmin;
    result.isBuiltIn = source.isBuiltIn;
    result.name = source.name;
    return result;
  }
}

export class UserGroupsDto {
  @ApiProperty({
    description: 'The user groups.',
    required: true,
    type: [UserGroupDto],
  })
  items: UserGroupDto[];

  static fromDomain(source: UserGroup[]) {
    const result = new UserGroupsDto();
    result.items = source.map(UserGroupDto.fromDomain);
    return result;
  }
}

export class UpsertTeamDto {
  @ApiProperty({
    description: 'The name of the team.',
    required: true,
  })
  name: string;
}

export class TeamUserDto {
  @ApiProperty({
    description: 'The user.',
    required: true,
  })
  user: UserDto;

  @ApiProperty({
    description: 'The role of the user within the team.',
    required: true,
  })
  role: string;

  @ApiProperty({
    description: 'The time when the user has been added to the team.',
    required: true,
  })
  created: Date;

  static fromDomain(source: TeamUser) {
    const result = new TeamUserDto();
    result.created = source.created;
    result.role = source.role;
    result.user = UserDto.fromDomain(source.user);
    return result;
  }
}

export class TeamDto {
  @ApiProperty({
    description: 'The ID of the team.',
    required: true,
  })
  id: number;

  @ApiProperty({
    description: 'The display name.',
    required: true,
  })
  name: string;

  @ApiProperty({
    description: 'The associated users.',
    required: true,
    type: [TeamUserDto],
  })
  users: TeamUserDto[];

  static fromDomain(source: Team) {
    const result = new TeamDto();
    result.id = source.id;
    result.name = source.name;
    result.users = source.users.map(TeamUserDto.fromDomain);
    return result;
  }
}

export class TeamsDto {
  @ApiProperty({
    description: 'The teams.',
    required: true,
    type: [TeamDto],
  })
  items: TeamDto[];

  static fromDomain(source: Team[]) {
    const result = new TeamsDto();
    result.items = source.map(TeamDto.fromDomain);
    return result;
  }
}

export class UpsertTeamUserDto {
  @ApiProperty({
    description: 'The ID or email address of the user.',
    required: true,
  })
  userIdOrEmail: string;

  @ApiProperty({
    description: 'The role of the user within the team.',
    required: true,
  })
  role: string;
}
