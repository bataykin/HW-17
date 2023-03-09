const bcrypt = require("bcrypt");

export class AuthHashClass {
  async _generateHash(password: string) {
    const hash = await bcrypt.hash(password, 10);
    return hash;
  }

  async _isHashesEquals(password: string, hash2: string) {
    const isEqual = await bcrypt.compare(password, hash2);
    return isEqual;
  }
}
