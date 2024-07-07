const errorHandlerMiddleware = (err, req, res, next) => {
  try {
    let customError = {
      statusCode: err.statusCode || 500,
      msg: err.message || "Something went wrong, try again later",
    };

    if (err.name === "SequelizeUniqueConstraintError") {
      customError.msg = err.errors[0].message || "Duplicate value entered";
      customError.statusCode = 400;
    } else if (err.name === "SequelizeValidationError") {
      customError.msg = err.errors.map((error) => error.message).join(", ");
      customError.statusCode = 400;
    } else if (err.name === "SequelizeForeignKeyConstraintError") {
      customError.msg = "Invalid reference to a non-existing resource";
      customError.statusCode = 400;
    } else if (err.name === "SequelizeDatabaseError") {
      customError.msg = "Error occurred";
      customError.statusCode = 500;
    }

    return res
      .status(customError.statusCode)
      .json({ error: { msg: customError.msg } });
  } catch (error) {
    console.error("Unexpected error", error);
    return res.status(500).json({ error: { msg: "Unexpected error" } });
  }
};

module.exports = errorHandlerMiddleware;
