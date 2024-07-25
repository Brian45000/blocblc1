const bcrypt = require("bcryptjs");
const { hashPassword } = require("../src/authUtils");

describe("hashPassword", () => {
  it("doit hasher le mot de passe", () => {
    const password = "password";
    const hashedPassword = hashPassword(password);

    expect(hashedPassword).not.toBe(password);

    const isMatch = bcrypt.compareSync(password, hashedPassword);
    expect(isMatch).toBe(true);
  });
});
