import { IsString, MaxLength } from "class-validator";

export default class AddAppToProjectDto {
    @MaxLength(200, { message: 'App Name should be 200 characters long or less'})
    @IsString()
    appName: string;
}