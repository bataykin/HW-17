import { BanUserInputModel } from "../../superadmin/dto/BanUserInputModel";

export const IUsersRepoToken = Symbol("IUsersRepoToken");

export interface IUsersRepo<GenericUserType> {
  createUser(
    login: string,
    email: string,
    passwordHash: string,
    confirmationCode: string,
  ): Promise<GenericUserType>;

  confirmEmail(code: string);

  deleteUser(id: string);

  updateConfirmationCode(email: string, code: string);

  addPasswordRecoveryCode(email: string, passRecoveryCode: string);

  renewPassword(recoveryCode: string, passwordHash: string);

  checkPassRecoveryCodeIsValid(recoveryCode: string);

  setBanStatus(userId: string, dto: BanUserInputModel);
}
