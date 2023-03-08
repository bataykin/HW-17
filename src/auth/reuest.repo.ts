import {ObjectId} from "mongodb";
import {addSeconds} from "date-fns";
import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {User, UserDocument} from "../users/user.schema";
import {Model} from "mongoose";
import {Request, RequestDocument} from "../guards/request.schema";


@Injectable()
export class RequestRepoClass {
    constructor(@InjectModel(Request.name) private requestModel: Model<RequestDocument>) {
    }

    async addRequest(ip: string, requestDate: Date, endpoint: string) {
        const request = {
            _id: new ObjectId(),
            ip: ip,
            requestDate: requestDate,
            endpoint: endpoint,
            login: 'login',
        }

        await this.requestModel.insertMany(request)

        return request
    }

    async addLoginRequest(ip: string, requestDate: Date, endpoint: string, login: string) {
        const request = {
            _id: new ObjectId(),
            ip: ip,
            requestDate: requestDate,
            endpoint: endpoint,
            login: login,
        }

        await this.requestModel.insertMany(request)

        return request
    }

    async getAttempts(ip: string, seconds: number, trueDate: Date, endpoint: string) {

        const attempts = await this.requestModel.countDocuments(
            {
                $and: [
                    {ip: ip},
                    {endpoint: endpoint},
                    {requestDate: {$gt: addSeconds(trueDate, -seconds)}}]
            })
        if (!attempts) {
            return 0
        } else {
            return attempts;
        }
    }

    async getLoginAttempts(login: string, ip: string, seconds: number, trueDate: Date) {
        const attempts = await this.requestModel.countDocuments(
            {
                $and: [
                    {login: login},
                    {requestDate: {$gt: addSeconds(trueDate, -seconds)}}
                ]
            })
        return attempts;
    }

    async getRegistrationAttempts(ip: string, seconds: number, trueDate: Date) {
        const attempts = await this.requestModel.countDocuments(
            {
                $and: [
                    {ip: ip},
                    {endpoint: "/auth/registration"},
                    {requestDate: {$gt: addSeconds(trueDate, -seconds)}}]
            })
        if (!attempts) {
            return 0
        } else {
            return attempts;
        }
    }

    async getAnyLoginAttempts(ip: string, seconds: number, trueDate: Date) {
        const attempts = await this.requestModel.countDocuments(
            {
                $and: [
                    {ip: ip},
                    {endpoint: "/auth/login"},
                    {requestDate: {$gt: addSeconds(trueDate, -seconds)}}]
            })
        if (!attempts) {
            return 0
        } else {
            return attempts;
        }
    }

    async getRegEmailResendAttempts(ip: string, seconds: number, trueDate: Date) {
        const attempts = await this.requestModel.countDocuments(
            {
                $and: [
                    {ip: ip},
                    {endpoint: "/auth/registration-email-resending"},
                    {requestDate: {$gt: addSeconds(trueDate, -seconds)}}]
            })
        if (!attempts) {
            return 0
        } else {
            return attempts;
        }
    }

}

