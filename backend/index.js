import app from "./server.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import ReferralsDAO from "./dao/referralDAO.js";
import orgService from "./api/orgService.js";
import cors from "cors";

let server;
dotenv.config();
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
    server = app.listen(port, () => {
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
export default server;
