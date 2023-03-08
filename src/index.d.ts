declare global {
  declare namespace Express {
    export interface Request {
      user: UserAccountDBType;
      lastAttempts: number;
      specificLoginAttempts: number;
      regAttempts: number;
      loginAttempts: number;
      anyLoginAttempts: number;
      regEmailResendAttempts: number;
    }
  }
}
