import { Controller } from "@nestjs/common";

@Controller("users")
export class UsersController {
  //   constructor(
  //     private readonly commandBus: CommandBus,
  //     private readonly queryBus: QueryBus,
  //   ) {}
  //
  //   @Post("registration")
  //   @HttpCode(204)
  //   async userRegistration(@Body() createUserDto: CreateUserDto) {
  //     return this.commandBus.execute(new RegistrationUserCommand(createUserDto));
  //   }
  //
  //   @Post()
  //   @HttpCode(204)
  //   async userResendRegistrationEmail(@Body() dto: EmailAndCodeSharedDTO) {
  //     return this.commandBus.execute(
  //       new ResendRegistrationEmailCommand(dto.email),
  //     );
  //   }
  //
  //   @Post()
  //   @HttpCode(204)
  //   async userConfirmRegistration(@Body() dto: EmailAndCodeSharedDTO) {
  //     return this.commandBus.execute(new ConfirmRegistrationCommand(dto.code));
  //   }
  //
  //   @Post("login")
  //   @HttpCode(200)
  //   async userLogin(@Body() dto: LoginDto, @Req() req: Request) {
  //     console.log(req);
  //     return 0;
  //     // return this.commandBus.execute(
  //     //   new LoginCommand(dto.loginOrEmail, dto.password),
  //     // );
  //   }
  // @UseGuards(BaseAuthGuard)
  // @Put(':id/ban')
  // async setBannedStatus (@Param('id') userId: string,
  //                        @Body() dto: BanUnbanUserDto){
  //     return this.commandBus.execute(new BanUnbanUserCommand(dto, userId))
  //
  // }
  //  QUERY  Returns all users paginated
  //
  // @HttpCode(200)
  // @Get()
  // async getAll(@Query() dto: CreateUserPaginatedDto) {
  //     return this.queryBus.execute(new GetUsersCommand(dto))
  // }
  //  COMMAND  Create new user
  //
  // @Post()
  // @UseGuards(BaseAuthGuard)
  // @UsePipes(new ValidationPipe({ transform: true }))
  // async create(@Body() createUserDto: CreateUserDto) {
  //     return this.commandBus.execute(new CreateUserCommand(createUserDto))
  // }
  //  COMMAND Delete user by id
  //
  // @HttpCode(204)
  // @Delete(':id')
  // @UseGuards(BaseAuthGuard)
  // async delete(@Param('id') id: string) {
  //     return this.commandBus.execute(new DeleteUSerCommand(id))
  // }
}
