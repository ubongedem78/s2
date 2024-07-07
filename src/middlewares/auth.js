const jwt = require("jsonwebtoken");
const { User } = require("../models/model");

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ where: { userId: decoded.userId } });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = { userId: user.userId };
    next();
  } catch (error) {
    console.error("Error in authenticate middleware", error);
    res.status(401).json({ message: "Token verification failed" });
  }
};

module.exports = authenticate;
