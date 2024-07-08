const { User, Organisation } = require("../models/model");
const { NotFoundError, UnauthenticatedError } = require("../errors");

const getUserById = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  try {
    const user = await User.findOne({ where: { userId: id } });
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (userId !== id) {
      const organisations = await Organisation.findAll({
        include: {
          model: User,
          where: { userId },
        },
      });

      const userInOrg = await Promise.all(
        organisations.map(async (org) => {
          const orgUsers = await org.getUsers({ where: { userId: id } });
          return orgUsers.length > 0;
        })
      );

      if (!userInOrg.some((isInOrg) => isInOrg)) {
        throw new UnauthenticatedError("Access denied");
      }
    }

    res.status(200).json({
      status: "success",
      message: "User fetched successfully",
      data: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Error fetching user", error);
    res.status(400).json({
      status: "Bad Request",
      message: "Client error",
      statusCode: 400,
    });
  }
};

module.exports = { getUserById };
