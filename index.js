const express = require("express");
require("./src/db/mongoose");
const dotenv = require("dotenv");
const userRouter = require("./src/routers/user");
const productRouter = require("./src/routers/product");
const cartRouter = require("./src/routers/cart");
const orderRouter = require("./src/routers/order");
const stripeRouter = require("./src/routers/stripe");

const app = express();
const port = process.env.PORT;

dotenv.config();

app.use(express.json());

app.use(userRouter);
app.use(productRouter);
app.use(cartRouter);
app.use(orderRouter);
app.use(stripeRouter);

app.listen(port, () => {
  console.log("Server is up on port " + port);
});
