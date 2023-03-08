const bcrypt = require('bcrypt');

export class AuthUtilsClass {
    // constructor(
    //     protected usersRepository: IUsersRepo<UserEntity>) {
    // }

    // async isExpiredIncorrectRT(token: string) {
    //
    // }
    //
    // async createRTokenDB(token: string) {
    //     await RefreshTokenModel.insertMany({
    //         token: token,
    //         isValid: true,
    //         expiresIn: addSeconds(new Date(), 20),
    //     })
    // }
    //
    // async checkRTIsValid(token: string) {
    //     const isNotExpired = await RefreshTokenModel.findOne({$and: [{token: token}, {isValid: true}, {$gt: {expiresAt: new Date()}}]})
    //     if (!isNotExpired) return null
    //     // console.log(isNotExpired.expiresAt)
    //     // console.log(new Date())
    //     // console.log(isNotExpired.expiresAt> new Date())
    //     return isNotExpired
    // }
    //
    // async revokeAndRefresh(oldToken: string, newToken: string) {
    //     // sign old token as invalid in DB
    //     await RefreshTokenModel.findOneAndUpdate(
    //         {token: oldToken},
    //         {isValid: false, replacedBy: newToken})
    //
    //     // create new DB record for new token
    //     await RefreshTokenModel.create({
    //         token: newToken,
    //         isValid: true,
    //         expiresIn: addSeconds(new Date(), 20)
    //     })
    // }
    //
    // async logoutToken(token: string) {
    //     await RefreshTokenModel.findOneAndUpdate(
    //         {token: token},
    //         {isValid: false, replacedBy: 'logout'})
    // }
    //
    //
    // async checkCredentials(login: string, password: string) {
    //
    //     //ищем юзера по логину
    //     const user = await this.usersRepository.findByLogin(login)
    //     //если не нашли выходим с нулл
    //     if (!user) {
    //         return null
    //     }
    //     //если стоит флаг не подтвержден имейл - выходим с нулл
    //     if (!user.emailConfirmation.isConfirmed) {
    //         return null
    //     }
    //
    //     // const passwordHash = await this._generateHash(password)
    //     const isHashesEquals = await this._isHashesEquals(password, user.accountData.passwordHash)
    //     //проверяем хэш пароля
    //     if (isHashesEquals) {
    //         return user
    //     } else {
    //         return null
    //     }
    // }

    async _generateHash(password: string) {
        const hash = await bcrypt.hash(password, 10)
        // console.log('hash: ' + hash)
        return hash
    }

    async _isHashesEquals(password: string, hash2: string) {
        const isEqual = await bcrypt.compare(password, hash2)
        return isEqual
    }
}