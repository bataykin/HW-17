import {IsEmail, IsString, Length} from "class-validator";

export class RegistrationDto {
    @IsString()
    @Length(3,10)
    login: string

    @IsEmail()
    email: string

    @IsString()
    @Length(6,20)
    password: string
}
