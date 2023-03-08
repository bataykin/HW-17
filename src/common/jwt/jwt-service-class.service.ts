import { Injectable } from "@nestjs/common";
import { Types } from "mongoose";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class JwtServiceClass {
  constructor(private readonly jwtService: JwtService) {}

  async getUserIdByToken(token: string): Promise<Types.ObjectId> | null {
    try {
      const result: any = this.jwtService.verify(token);
      return result.userId;
    } catch (error: any) {
      error.message += "Token expired " + error.message;
      return null;
    }
  }
}
