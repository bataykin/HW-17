import { SAUserViewModel } from "../../superadmin/dto/SAUserViewModel";
import { CreateUserPaginatedDto } from "../dto/create.user.paginated.dto";
import { UserEntity } from "../entity/user.entity";

export const IUsersQueryRepoToken = Symbol("IUsersQueryRepoToken");

export interface IUsersQueryRepo<GenericUserType> {
  findById(id: string): Promise<GenericUserType>;

  getUsers({
    pageNumber = 1,
    pageSize = 10,
  }: CreateUserPaginatedDto): Promise<GenericUserType[]>;

  countDocuments(): Promise<number>;

  countUsersBySearchname(
    searchLoginTerm: string,
    searchEmailTerm: string,
  ): Promise<number>;

  findByEmail(email: string): Promise<GenericUserType | null>;

  findByLogin(login: string): Promise<GenericUserType | null>;

  checkLoginEmailExists(login: string, email: string): Promise<string> | null;

  checkCodeExists(code: string): Promise<GenericUserType | null>;

  getBanStatus(userId: string): Promise<boolean>;

  mapUserEntityToResponse(user: UserEntity): Promise<SAUserViewModel>;
}
