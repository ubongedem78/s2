const { Organisation, User } = require("../models/model");
const { NotFoundError } = require("../errors");

const createOrganisation = async (req, res) => {
  const { name, description } = req.body;

  try {
    const organisation = await Organisation.create({
      name,
      description,
    });

    const user = await User.findByPk(req.user.userId);
    await user.addOrganisation(organisation);

    res.status(201).json({
      status: "success",
      message: "Organisation created successfully",
      data: {
        orgId: organisation.orgId,
        name: organisation.name,
        description: organisation.description,
      },
    });
  } catch (error) {
    console.error("Error creating organisation", error);
    res.status(400).json({
      status: "Bad Request",
      message: "Client error",
      statusCode: 400,
    });
  }
};

const getOrganisations = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      include: Organisation,
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const organisations = user.Organisations;

    res.status(200).json({
      status: "success",
      message: "Organisations retrieved successfully",
      data: {
        organisations,
      },
    });
  } catch (error) {
    console.error("Error getting organisations", error);
    res.status(400).json({
      status: "Bad Request",
      message: "Client error",
      statusCode: 400,
    });
  }
};

const getOrganisationById = async (req, res) => {
  const { orgId } = req.params;

  try {
    const organisation = await Organisation.findOne({
      where: { orgId },
      include: User,
    });

    if (!organisation) {
      throw new NotFoundError("Organisation not found");
    }

    const hasAccess = organisation.Users.some(
      (user) => user.userId === req.user.userId
    );

    if (!hasAccess) {
      return res.status(401).json({ message: "Access denied" });
    }

    res.status(200).json({
      status: "success",
      message: "Organisation fetched successfully",
      data: {
        orgId: organisation.orgId,
        name: organisation.name,
        description: organisation.description,
      },
    });
  } catch (error) {
    console.error("Error fetching organisation", error);
    res.status(404).json({
      status: "Not Found",
      message: "Organisation not found",
      statusCode: 404,
    });
  }
};

const addUserToOrganisation = async (req, res) => {
  const { orgId } = req.params;
  const { userId } = req.body;

  try {
    const organisation = await Organisation.findOne({ where: { orgId } });
    if (!organisation) {
      throw new NotFoundError("Organisation not found");
    }

    const user = await User.findOne({ where: { userId } });
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const userInOrg = await organisation.hasUser(user);
    if (userInOrg) {
      return res.status(400).json({
        status: "Bad Request",
        message: "User already in organisation",
        statusCode: 400,
      });
    }

    await organisation.addUser(user);

    res.status(200).json({
      status: "success",
      message: "User added to organisation successfully",
    });
  } catch (error) {
    console.error("Error adding user to organisation", error);
    res.status(400).json({
      status: "Bad Request",
      message: "Client error",
      statusCode: 400,
    });
  }
};

module.exports = {
  createOrganisation,
  getOrganisations,
  getOrganisationById,
  addUserToOrganisation,
};
