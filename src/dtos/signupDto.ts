import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export default class SignupDto {

    @IsNotEmpty()
    @IsString()
    firstName: string;

     @IsNotEmpty()
    @IsString()
    lastName: string;

     @IsNotEmpty()
    @IsString()
     email: string;
    
    @IsNotEmpty()
    @IsString()
    password: string;

    @IsOptional()
    @IsString()
    phone: string;
}