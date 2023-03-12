import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { BanUserInputModel } from "./dto/BanUserInputModel";
import { BaseAuthGuard } from "../guards/base.auth.guard";
import { CreateUserDto } from "../users/dto/create.user.dto";
import { SA_BanUnbanUserCommand } from "./useCase/SA_BanUnbanUserHandler";
import { SA_GetUsersQuery } from "./useCase/SA_GetUsersHandler";
import { SA_CreateUserCommand } from "./useCase/SA_CreateUserHandler";
import { SA_DeleteUserCommand } from "./useCase/SA_DeleteUserHandler";
import { SAGetUsersPaginationModel } from "./dto/SAGetUsersPaginationModel";
import { SkipThrottle } from "@nestjs/throttler";
import { BlogsPaginationDto } from "../bloggers/dto/blogsPaginationDto";
import { SA_GetBlogsQuery } from "./useCase/SA_GetBlogsHandler";

@SkipThrottle()
@Controller("sa")
export class SuperAdminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Put("users/:id/ban")
  @UseGuards(BaseAuthGuard)
  @HttpCode(204)
  async setBannedStatus(
    @Param("id", ParseUUIDPipe) userId: string,
    @Body() dto: BanUserInputModel,
  ) {
    return this.commandBus.execute(new SA_BanUnbanUserCommand(dto, userId));
  }

  @Get("users")
  @UseGuards(BaseAuthGuard)
  @HttpCode(200)
  async getAllUsers(@Query() dto: SAGetUsersPaginationModel) {
    return this.queryBus.execute(new SA_GetUsersQuery(dto));
  }

  @Post("users")
  @UseGuards(BaseAuthGuard)
  // @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(201)
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.commandBus.execute(new SA_CreateUserCommand(createUserDto));
  }

  @Delete("users/:id")
  @UseGuards(BaseAuthGuard)
  @HttpCode(204)
  async deleteUser(@Param("id", ParseUUIDPipe) userId: string) {
    return this.commandBus.execute(new SA_DeleteUserCommand(userId));
  }

  @Get("blogs")
  @UseGuards(BaseAuthGuard)
  @HttpCode(200)
  async getAllBlogs(@Query() dto: BlogsPaginationDto) {
    return this.queryBus.execute(new SA_GetBlogsQuery(dto));
  }
}
