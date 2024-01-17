import { ApiProperty } from '@nestjs/swagger';
import { isEmpty, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UserCreateParams {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  last_name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  role_id: number;
}

export class UserUpdateParams {
  @IsString()
  @ApiProperty()
  @IsOptional()
  first_name: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  last_name: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  email: string;

  @IsNumber()
  @ApiProperty()
  @IsOptional()
  role_id: number;
}
