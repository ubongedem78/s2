const express = require("express");
const app = express();
const { readdirSync } = require("fs");
const path = require("path");
const { sequelize } = require("./src/config/database");
const errorHandlerMiddleware = require("./src/middlewares/error_Handler");

app.use(express.json());
app.use(express.static(path.join(__dirname, "src")));
app.use(express.urlencoded({ extended: false }));

readdirSync("./src/routes").map((routePath) => {
  if (routePath === "auth.route.js") {
    return app.use("/api", require(`./src/routes/${routePath}`));
  }
  app.use("/api", /* authenticate */ require(`./src/routes/${routePath}`));
});

app.get("/", (req, res) => {
  res.send("I AM WORKING BUT YOUVE GOTTA WORK TOO!");
});

app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`s2 Server is running on PORT: ${PORT}.`);
  sequelize
    .authenticate()
    .then(() => {
      console.log("s2 Database connected");
    })
    .catch((error) => {
      console.log("Error connecting to s2 Database", error);
    });
});

module.exports = app;
