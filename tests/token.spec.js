const jwt = require("jsonwebtoken");
const { User } = require("../src/models/model");
require("dotenv").config();

describe("Token Generation", () => {
  it("should generate a token with correct expiration time and user details", async () => {
    const user = await User.create({
      firstName: "Test",
      lastName: "User",
      email: "testuser@example.com",
      password: "password123",
      phone: "1234567890",
    });

    const token = user.createJWT();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    expect(decoded.userId).toBe(user.userId);
    expect(decoded.exp).toBeDefined();
  }, 10000);
});
