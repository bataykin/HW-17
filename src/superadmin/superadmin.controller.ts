import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseBoolPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { BindBlogToUserDto } from './dto/BindBlogToUserDto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { BanUnbanUserDto } from '../users/dto/BanUnbanUserDto';
import { SA_BanUnbanUserCommand } from '../users/useCase/banUnbanUserHandler';
import { CreateUserPaginatedDto } from '../users/dto/create.user.paginated.dto';
import { SA_GetUsersQuery } from '../users/useCase/getUsersHandler';
import { BaseAuthGuard } from '../guards/base.auth.guard';
import { CreateUserDto } from '../users/dto/create.user.dto';
import { SA_CreateUserCommand } from '../users/useCase/createUserHandler';
import { SA_DeleteUserCommand } from '../users/useCase/deleteUserHandler';
import { BlogsPaginationDto } from '../bloggers/dto/blogsPaginationDto';
import { SA_BindBlogToUserCommand } from './useCase/bindBlogToUserHandler';
import { SkipThrottle } from '@nestjs/throttler';
import { SA_GetAllBlogsQuery } from './useCase/SAGetAllBloggersHandler';
import { SA_SetBanToBlogCommand } from './useCase/setBanToBlogHandler';

@SkipThrottle()
@Controller('sa')
export class SuperadminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Put('blogs/:id/ban')
  @UseGuards(BaseAuthGuard)
  @HttpCode(204)
  async setBanToBlog(
    @Param('id', ParseUUIDPipe) blogId: string,
    @Body('isBanned', ParseBoolPipe) isBanned: boolean,
  ) {
    return this.commandBus.execute(
      new SA_SetBanToBlogCommand(blogId, isBanned),
    );
  }

  @Put('blogs/:id/bind-with-user/:userId')
  @UseGuards(BaseAuthGuard)
  @HttpCode(204)
  async bindBlogToUser(@Param() dto: BindBlogToUserDto) {
    return this.commandBus.execute(
      new SA_BindBlogToUserCommand(dto.id, dto.userId),
    );
  }

  @Get('blogs')
  @UseGuards(BaseAuthGuard)
  @HttpCode(200)
  async getAllBlogs(@Query() dto: BlogsPaginationDto) {
    return this.queryBus.execute(new SA_GetAllBlogsQuery(dto));
  }

  @Put('users/:id/ban')
  @UseGuards(BaseAuthGuard)
  @HttpCode(204)
  async setBannedStatus(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() dto: BanUnbanUserDto,
  ) {
    return this.commandBus.execute(new SA_BanUnbanUserCommand(dto, userId));
  }

  @Get('users')
  @UseGuards(BaseAuthGuard)
  async getAllUsers(@Query() dto: CreateUserPaginatedDto) {
    return this.queryBus.execute(new SA_GetUsersQuery(dto));
  }

  @Post('users')
  @UseGuards(BaseAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.commandBus.execute(new SA_CreateUserCommand(createUserDto));
  }

  @Delete('users/:id')
  @UseGuards(BaseAuthGuard)
  @HttpCode(204)
  async deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.commandBus.execute(new SA_DeleteUserCommand(id));
  }
}
