import { BanUnbanUserDto } from './dto/BanUnbanUserDto';
import { CreateUserPaginatedDto } from './dto/create.user.paginated.dto';
import { UserEntity } from './entity/user.entity';

export const IUsersRepoToken = Symbol('IUsersRepoToken');

export interface IUsersRepo<GenericUserType> {
  checkLoginEmailExists(login: string, email: string): Promise<string> | null;

  createUser(
    login: string,
    email: string,
    passwordHash: string,
    code: string,
  ): Promise<GenericUserType>;

  confirmEmail(code: string);

  findById(id: string): Promise<GenericUserType>;

  getUsersPaginated({
    pageNumber = 1,
    pageSize = 10,
  }: CreateUserPaginatedDto): Promise<GenericUserType[]>;

  countDocuments(): Promise<number>;

  countUsersBySearchname(searchLoginTerm: string, searchEmailTerm: string);

  deleteUser(id: string);

  checkCodeExists(code: string): Promise<GenericUserType | null>;

  findByEmail(email: string): Promise<GenericUserType | null>;

  updateConfirmationCode(email: string, code: string);

  findByLoginOrEmail(username: string): Promise<GenericUserType | null>;

  addPasswordRecoveryCode(email: string, passRecoveryCode: string);

  renewPassword(recoveryCode: string, passwordHash: string);

  checkPassRecoveryCodeIsValid(recoveryCode: string);

  setBanStatus(userId: string, dto: BanUnbanUserDto);

  getBanStatus(userId: string): Promise<boolean>;

  mapUserEntityToResponse(user: UserEntity);

  mapArrayOfUserEntitiesToResponse(users: UserEntity[]);
}
