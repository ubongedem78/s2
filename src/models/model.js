const { sequelize } = require("../config/database");
const { DataTypes } = require("sequelize");
const { STRING, UUID, UUIDV4 } = DataTypes;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = sequelize.define(
  "User",
  {
    userId: {
      type: UUID,
      defaultValue: UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      set(value) {
        this.setDataValue("email", value.toLowerCase());
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
    },
  },
  {
    hooks: {
      beforeCreate: async (user) => {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

const Organisation = sequelize.define("Organisation", {
  orgId: {
    type: UUID,
    defaultValue: UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
  },
});

User.prototype.createJWT = function () {
  return jwt.sign({ userId: this.userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

User.prototype.comparePassword = async function (password) {
  const isMatch = await bcrypt.compare(password, this.password);
  return isMatch;
};

User.belongsToMany(Organisation, {
  through: "UserOrganisations",
  foreignKey: "userId",
});
Organisation.belongsToMany(User, {
  through: "UserOrganisations",
  foreignKey: "orgId",
});

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database & tables created!");
  })
  .catch((error) => {
    console.log("Database Sync Failed", error);
  });

module.exports = { User, Organisation };
