import app from "./server.js";
import mongodb from "mongodb";
import dotenv from "dotenv";
import ReferralsDAO from "./dao/referralDAO.js";
import orgService from "./api/orgService.js";
import mongoose from "mongoose";
import cors from "cors";
dotenv.config();
const port = process.env.PORT || 8000;

mongoose
  .connect(process.env.REFERRALS_DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: process.env.REFERRALS_NS,
  })
  .then(() => console.log("MongoDB is  connected successfully"))
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
  });

export default app; // Exporting the app object
