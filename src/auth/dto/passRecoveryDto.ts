import { IsEmail } from 'class-validator';

export class passRecoveryDto {
  @IsEmail()
  email: string;
}
