import express from "express";
import cors from "cors";
import referrals from "./api/referrals.route.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000", // Replace with your desired origin URL
    credentials: true,
  })
);

// Server can accept json in request body
app.use(express.json());
app.use(cookieParser());
app.use("/api/v1", referrals);
// If you go into a route that is not in the file
app.use("*", (req, res, next) => {
  if (!res.headersSent) {
    res.status(404).json({ error: "Not found" });
  } else {
    next();
  }
});
// So we can import in a file that accesses the database
module.exports = app;
