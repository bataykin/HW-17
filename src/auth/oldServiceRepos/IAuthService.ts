import { RegistrationDto } from "../dto/registration.dto";
import { Types } from "mongoose";

export interface IAuthService {
    confirmRegistration(code: string): any,

    registration({login, email, password}: RegistrationDto): any,

    resendRegistrationEmail(email: string): any,

    login(user: string): any,

    refreshTokens(token: string, userId: Types.ObjectId): any,

    aboutMe(userId: Types.ObjectId): any,

    validateUser(username: string, pass: string): Promise<any>,

    // findAll(): any,
    //
    // findOne(id: number): any,
    //
    // update(id: number, updateAuthDto: UpdateAuthDto): any,
    //
    // remove(id: number): any,

    getTokenFromDB (token: any): any,

    retrieveUser(refToken: string): any,

    logoutUser(refToken: any): any,
}

export const IAuthServiceToken = Symbol("IAuthService");

export abstract class AAuthService {
    abstract confirmRegistration(code: string): any;

    abstract registration({login, email, password}: RegistrationDto): any;

    abstract resendRegistrationEmail(email: string): any;

    abstract login(user: string): any;

    abstract refreshTokens(token: string, userId: string): any;

    abstract getTokenFromDB (token: any): any;

    abstract aboutMe(userId: string): any;

    abstract validateUser(username: string, pass: string): Promise<any>;

    // abstract findAll(): any;
    //
    // abstract findOne(id: number): any;
    //
    // abstract update(id: number, updateAuthDto: UpdateAuthDto): any;
    //
    // abstract remove(id: number): any;

    abstract retrieveUser(refToken: string): any;

    abstract logoutUser(refToken: any): any;
}