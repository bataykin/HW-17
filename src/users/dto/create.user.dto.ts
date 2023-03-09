import { IsEmail, Length } from "class-validator";

export class CreateUserDto {
  @Length(3, 10)
  login: string;

  @Length(6, 20)
  password: string;

  @IsEmail()
  email: string;
}
