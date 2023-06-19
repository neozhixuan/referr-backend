import app from "./server.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import ReferralsDAO from "./dao/referralDAO.js";
import orgService from "./api/orgService.js";
import cors from "cors";
import express from "express";
import referrals from "./api/referrals.route.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();

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

const port = process.env.PORT || 8000;
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: __dirname + "/.env" });
}
mongoose
  .connect(process.env.REFERRALS_DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "Backend", // Set the desired database name here
  })
  .then(() => console.log("MongoDB is connected successfully"))
  .catch((err) => {
    console.error(err.stack);
    process.exit(1);
  })
  .then(async () => {
    const conn = mongoose.connection;
    await ReferralsDAO.injectDB(conn);
    await orgService.injectDB(conn);
    app.use(cors());

    // How we start the web server after connecting
    app.listen(port, () => {
      // Log the process
      console.log(`listening on port ${port}`);
    });
    app.use("/", require(path.join(__dirname, "api", "v1")));
    if (process.env.NODE_ENV === "production") {
      app.use(express.static(path.join(__dirname, "../frontend", "build")));
      app.get("/*", (req, res) => {
        res.sendFile(
          path.join(__dirname, "../frontend", "build", "index.html")
        );
      });
    }
    // Export the server for Vercel deployment
  });

export default app;
