import { ApiProperty } from '@nestjs/swagger';

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginParams {
  // @IsEmail()
  // @IsNotEmpty()
  @ApiProperty()
  username: string;

  // @IsString()
  // @IsNotEmpty()
  @ApiProperty()
  password: string;
}
