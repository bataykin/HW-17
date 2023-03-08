import {IsString, IsUUID, Length} from "class-validator";

export class RenewPasswordDto {
    @IsString()
    @Length(6,20)
    newPassword: string

    @IsUUID()
    recoveryCode: string

}