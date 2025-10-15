const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const cookieParser = require("cookie-parser");

const purchase = require("./routes/purchaseRoute");

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["https://nepcart.vercel.app", "https://nepmartz.vercel.app", "https://admin-client-sand.vercel.app"], //frontend domain
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/feedback", require("./routes/FeedbackRoute"));
app.use("/api/decode", require("./routes/Decode"));
app.use("/api/product", require("./routes/products"));
app.use("/api/cart", require("./routes/cart"));
app.use("/purchase", purchase)
app.use("/custom", require("./routes/CustomProductRoute"))
app.use("/orderc", require("./routes/customOrder"))
app.use("/api/updatemsg", require("./routes/updateMsg"));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(
        `DB connected sucesfully and server is running at port: ${process.env.PORT}`
      );
    });
  })
  .catch((err) => {
    console.log(err);
  });
