import { SA_UserViewModel } from "../../superadmin/dto/SA_UserViewModel";
import { UserEntity } from "../entity/user.entity";
import { SAGetUsersPaginationModel } from "../../superadmin/dto/SAGetUsersPaginationModel";

export const IUsersQueryRepoToken = Symbol("IUsersQueryRepoToken");

export interface IUsersQueryRepo<GenericUserType> {
  findById(id: string): Promise<GenericUserType>;

  SA_GetUsers(dto: SAGetUsersPaginationModel): Promise<GenericUserType[]>;

  countDocuments(): Promise<number>;

  SA_CountUsersBySearch(
    searchLoginTerm: string,
    searchEmailTerm: string,
    banStatus: string,
  ): Promise<number>;

  findByEmail(email: string): Promise<GenericUserType | null>;

  findByLogin(login: string): Promise<GenericUserType | null>;

  checkLoginEmailExists(login: string, email: string): Promise<string> | null;

  checkCodeExists(code: string): Promise<GenericUserType | null>;

  getBanStatus(userId: string): Promise<boolean>;

  SA_mapUserEntityToResponse(user: UserEntity): Promise<SA_UserViewModel>;
  SA_mapUserEntitiesToResponse(
    users: UserEntity[],
  ): Promise<SA_UserViewModel[]>;
}
