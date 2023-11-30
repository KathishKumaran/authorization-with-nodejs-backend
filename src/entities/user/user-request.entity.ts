import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

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
