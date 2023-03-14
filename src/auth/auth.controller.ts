import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Logger,
  ParseUUIDPipe,
  Post,
  Request,
  Response,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { RegistrationDto } from "./dto/registration.dto";
import { LoginDto } from "./dto/login.dto";
import { RequestLimitGuard } from "../guards/request.limit.guard";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { jwtConstants } from "./constants";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ConfirmRegistrationCommand } from "./useCase/confirmRegistrationHandler";
import { RegistrationUserCommand } from "./useCase/registrationUserHandler";
import { ResendRegistrationEmailCommand } from "./useCase/resendRegistrationEmailHandler";
import { LoginCommand } from "./useCase/loginHandler";
import { RefreshTokensCommand } from "./useCase/refreshTokensHandler";
import { LogoutCommand } from "./useCase/logoutHandler";
import { AboutMeCommand } from "./useCase/aboutMeHandler";
import { passRecoveryDto } from "./dto/passRecoveryDto";
import { PasswordRecoveryCommand } from "./useCase/passwordRecoveryHandler";
import { RenewPasswordDto } from "./dto/renewPasswordDto";
import { RenewPasswordCommand } from "./useCase/renewPasswordHandler";

// @SkipThrottle()
@Controller("auth")
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly logger: Logger,
  ) {}

  @HttpCode(204)
  @UseGuards(RequestLimitGuard)
  @Post("password-recovery")
  async passwordRecovery(@Body() dto: passRecoveryDto) {
    return this.commandBus.execute(new PasswordRecoveryCommand(dto));
  }

  @HttpCode(204)
  @UseGuards(RequestLimitGuard)
  @Post("new-password")
  async renewPassword(@Body() dto: RenewPasswordDto) {
    return this.commandBus.execute(
      new RenewPasswordCommand(dto.newPassword, dto.recoveryCode),
    );
  }

  @HttpCode(204)
  @UseGuards(RequestLimitGuard)
  @Post("registration-confirmation")
  async confirmRegistration(
    @Body(
      "code",
      new ParseUUIDPipe({
        errorHttpStatusCode: HttpStatus.BAD_REQUEST,
        exceptionFactory: (error) => {
          throw new BadRequestException({
            message: "code " + error,
            field: "code",
          });
        },
      }),
    )
    code: string,
  ) {
    return this.commandBus.execute(new ConfirmRegistrationCommand(code));
  }

  @HttpCode(204)
  @UseGuards(RequestLimitGuard)
  @Post("registration")
  async registration(@Body() dto: RegistrationDto) {
    return this.commandBus.execute(new RegistrationUserCommand(dto));
    // const result = await this.authService.registration(dto);
    // return (result) ? (true) : false
  }

  @HttpCode(204)
  @UseGuards(RequestLimitGuard)
  @Post("registration-email-resending")
  async resendRegistrationEmail(@Body() email: passRecoveryDto) {
    return this.commandBus.execute(
      new ResendRegistrationEmailCommand(email.email),
    );
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  // @UseGuards(RequestLimitGuard)
  @UsePipes(new ValidationPipe())
  @Post("login")
  async login(
    @Request() req,
    @Response({ passthrough: true }) res,
    @Body() dto: LoginDto,
    @Ip() ip,
  ) {
    if (req.user.isBanned) {
      throw new UnauthorizedException(
        `user ${req.user?.login} is banned, reason: ${req.user?.banReason}`,
      );
    }
    const tokens = await this.commandBus.execute(
      new LoginCommand(req.user, req.get("user-agent"), req.get("host")),
    );
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: jwtConstants.httpOnly,
      secure: jwtConstants.cookieSecure,
    });
    return {
      accessToken: tokens.accessToken,
    };
  }

  @HttpCode(200)
  @Post("refresh-token")
  async refreshTokens(@Request() req, @Response({ passthrough: true }) res) {
    const refToken = req.cookies?.refreshToken;
    const tokens = await this.commandBus.execute(
      new RefreshTokensCommand(
        refToken,
        req.get("user-agent"),
        req.get("host"),
      ),
    );
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: jwtConstants.httpOnly,
      secure: jwtConstants.cookieSecure,
    });
    return {
      accessToken: tokens.accessToken,
    };
  }

  @HttpCode(204)
  @Post("logout")
  async logout(@Request() req, @Response({ passthrough: true }) res) {
    const refToken = req.cookies.refreshToken;
    return await this.commandBus.execute(new LogoutCommand(refToken));
  }

  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @Get("me")
  async aboutMe(@Request() req) {
    const token = req.headers.authorization.split(" ")[1];
    return this.queryBus.execute(new AboutMeCommand(token));
  }
}
