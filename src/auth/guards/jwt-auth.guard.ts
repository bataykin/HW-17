import {
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  IUsersQueryRepo,
  IUsersQueryRepoToken,
} from "../../users/DAL/IUserQueryRepo";
import { UserEntity } from "../../users/entity/user.entity";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(
    @Inject(IUsersQueryRepoToken)
    private readonly usersQueryRepo: IUsersQueryRepo<UserEntity>,
    private readonly jwtService: JwtService,
  ) {
    super();
  }
  canActivate(context: ExecutionContext) {
    // const request = context.switchToHttp().getRequest();
    // const accessToken = request.headers.authorization.split(" ")[1];
    // const retrievedUserFromToken = accessToken
    //   ? this.jwtService.verify(accessToken, {
    //       secret: jwtConstants.secret,
    //     })
    //   : null;
    // const userFromToken = retrievedUserFromToken
    //   ? this.usersQueryRepo.findById(retrievedUserFromToken.userId)
    //   : null;
    // if (!userFromToken) throw new UnauthorizedException("no user");

    // Add your custom authentication logic here
    // for example, call super.logIn(request) to establish a session.

    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new UnauthorizedException(err);
    }
    return user;
  }
}
