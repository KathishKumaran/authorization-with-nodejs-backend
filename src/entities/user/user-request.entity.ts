import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UserCreateParams {
  @IsNotEmpty()
  @ApiProperty()
  first_name: string;

  @IsNotEmpty()
  @ApiProperty()
  last_name: string;

  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @ApiProperty()
  role_id: number;

  @IsNotEmpty()
  @ApiProperty()
  organization_id: number;
}

export class UserListQueryParams {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  q: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  page: number;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  email: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  role: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  per_page: number;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  last_name: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  first_name: string;
}

export class UserUpdateParams {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  first_name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  last_name: string;
}

export class UserIdsAndNamesQueryParams {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  role: string;
}
