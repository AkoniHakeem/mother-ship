import { IsNotEmpty, IsString } from "class-validator";

export default class SigninDto {
    @IsNotEmpty()
    @IsString()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}