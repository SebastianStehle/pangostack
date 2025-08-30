import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsNumber, IsObject, IsString } from 'class-validator';

export class ResourceRequestDto {
  @ApiProperty({
    description: 'The resource ID.',
    required: true,
  })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  resourceUniqueId: string;

  @ApiProperty({
    description: 'The name of the resource type.',
    required: true,
  })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  resourceType: string;

  @ApiProperty({
    description: 'The parameters.',
    required: true,
    additionalProperties: true,
  })
  @IsDefined()
  @IsObject()
  parameters: Record<string, any>;

  @ApiProperty({
    description: 'Context that only contains values that are needed for this resource betwene subsequent calls.',
    required: true,
    additionalProperties: true,
  })
  @IsDefined()
  @IsObject()
  resourceContext: Record<string, any>;

  @ApiProperty({
    description: 'The resource ID.',
    required: true,
  })
  @IsDefined()
  @IsNumber()
  @IsNotEmpty()
  timeoutMs: number;
}

export class ValidationErrorItemDto {
  @ApiProperty({
    description: 'The full property path.',
    required: true,
  })
  property: string;

  @ApiProperty({
    description: 'The violated constraints',
    required: true,
  })
  constraints: Record<string, string>;
}

export class ErrorResponseDto {
  @ApiProperty({
    description: 'The error details.',
    required: true,
  })
  message: any;

  @ApiProperty({
    description: 'The error itself.',
    required: true,
  })
  error: string;

  @ApiProperty({
    description: 'The status code.',
    required: true,
  })
  statusCode: number;
}

export function ApiDefaultResponses() {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description: 'Bad Request',
      type: ErrorResponseDto,
    }),
    ApiResponse({
      status: 500,
      description: 'Internal Server Error',
    }),
  );
}
