const { User, Organisation } = require("../models/model");
const {
  UnauthenticatedError,
  BadRequestError,
  NotFoundError,
} = require("../errors");
const register = async (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body;

  try {
    switch (true) {
      case firstName.length < 2:
        throw new BadRequestError(
          "First Name must be at least 2 characters long"
        );
      case lastName.length < 2:
        throw new BadRequestError(
          "Last Name must be at least 2 characters long"
        );
    }

    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
    });

    const organisationName = `${firstName}'s Organisation`;

    const organisation = await Organisation.create({
      name: organisationName,
    });

    await user.addOrganisation(organisation);

    const token = await user.createJWT();

    res.status(201).json({
      status: "success",
      message: "Registration successful",
      data: {
        accessToken: token,
        user: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
        },
      },
    });
  } catch (error) {
    console.error("Error creating user", error);
    res.status(400).json({
      status: "Bad request",
      message: "Registration unsuccessful",
      statusCode: 400,
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      throw new BadRequestError("Please provide email and password");
    }

    req.body.email = email.toLowerCase();

    const user = await User.findOne({ where: { email: email } });

    if (!user) {
      throw new UnauthenticatedError("Invalid credentials");
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    if (!emailRegex.test(email)) {
      throw new BadRequestError("Invalid email address");
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new UnauthenticatedError("Invalid credentials");
    }

    const token = await user.createJWT();

    res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        accessToken: token,
        user: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
        },
      },
    });
  } catch (error) {
    console.error("Error logging in", error);
    res.status(401).json({
      status: "Bad request",
      message: "Authentication failed",
      statusCode: 401,
    });
  }
};

module.exports = { register, login };
